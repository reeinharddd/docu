// Spec — function: semantic search with the 768 embedding contract (F6 ·
// IA.md §6 · EMBEDDINGS contract: vector(768) is a border of the ER).
// Demo scripts: G5 (bandeja), G6 (consulta con citas).

import { beforeAll, describe, expect, test } from 'bun:test'
import { randomUUID } from 'node:crypto'
import type { Client } from 'pg'
import {
  explainPlan,
  type FacilitySeed,
  firstRow,
  getSpecDb,
  pgErrorOf,
  seedFacility,
  vectorLiteral,
} from './helpers/spec-db.js'

const suite = process.env.DB_TEST === '1' ? describe : describe.skip

let client: Client
let seed: FacilitySeed

async function insertEntityWithEmbedding(
  code: string,
  values: number[],
): Promise<string> {
  const typeId = randomUUID()
  await client.query(
    `INSERT INTO "graph"."entity_type"
       ("id", "facility_id", "code", "name", "schema_definition", "created_by_id", "updated_at")
     VALUES ($1, $2, $3, $4, '{"fields":[]}', $5, now())`,
    [typeId, seed.facilityId, code, `Tipo ${code}`, seed.workerId],
  )
  const entityId = randomUUID()
  await client.query(
    `INSERT INTO "graph"."entity"
       ("id", "facility_id", "entity_type_id", "code", "data", "created_by_id", "updated_at")
     VALUES ($1, $2, $3, $4, '{}', $5, now())`,
    [entityId, seed.facilityId, typeId, code, seed.workerId],
  )
  await client.query(
    `INSERT INTO "platform"."memory_embedding"
       ("id", "facility_id", "entity_id", "chunk", "embedding", "model")
     VALUES ($1, $2, $3, $4, $5::vector, 'spec-embedding')`,
    [
      randomUUID(),
      seed.facilityId,
      entityId,
      `chunk ${code}`,
      vectorLiteral(values),
    ],
  )
  return entityId
}

suite('vector search', () => {
  beforeAll(async () => {
    client = await getSpecDb()
    seed = await seedFacility(client, 'VEC', ['escaneado'])
  }, 60000)

  test('an embedding of exactly 768 dimensions is accepted', async () => {
    const entityId = await insertEntityWithEmbedding(
      'vec-ok',
      Array.from({ length: 768 }, (_value, index) => (index % 10) * 0.01),
    )
    const stored = await client.query<{ id: string }>(
      `SELECT "id" FROM "platform"."memory_embedding" WHERE "entity_id" = $1`,
      [entityId],
    )
    expect(stored.rows).toHaveLength(1)
  })

  test('an embedding of any other dimension is rejected (vector(768))', async () => {
    const wrong = Array.from(
      { length: 767 },
      (_value, index) => (index % 10) * 0.01,
    )
    const error = await pgErrorOf(() =>
      client.query(
        `INSERT INTO "platform"."memory_embedding"
           ("id", "facility_id", "chunk", "embedding", "model")
         VALUES ($1, $2, 'chunk', $3::vector, 'spec-embedding')`,
        [randomUUID(), seed.facilityId, vectorLiteral(wrong)],
      ),
    )
    expect(error.message).toContain('768')
  })

  test('cosine KNN returns the exact match first', async () => {
    await insertEntityWithEmbedding(
      'vec-target',
      Array.from(
        { length: 768 },
        (_value, index) => ((index * 7) % 23) * 0.004,
      ),
    )
    await insertEntityWithEmbedding(
      'vec-otro',
      Array.from(
        { length: 768 },
        (_value, index) => 1 - ((index * 7) % 23) * 0.004,
      ),
    )

    const queryVector = Array.from(
      { length: 768 },
      (_value, index) => ((index * 7) % 23) * 0.004,
    )
    const nearest = await client.query<{ code: string; distance: number }>(
      `SELECT e."code", m."embedding" <=> $1::vector AS distance
       FROM "platform"."memory_embedding" m
       JOIN "graph"."entity" e
         ON e."id" = m."entity_id" AND e."facility_id" = m."facility_id"
       ORDER BY m."embedding" <=> $1::vector
       LIMIT 1`,
      [vectorLiteral(queryVector)],
    )
    expect(firstRow(nearest.rows).code).toBe('vec-target')
    expect(Number(firstRow(nearest.rows).distance)).toBeCloseTo(0, 5)
  })

  test('the KNN path is index-backed, not a brute-force scan', async () => {
    const queryVector = Array.from(
      { length: 768 },
      (_value, index) => (index % 5) * 0.02,
    )
    const plan = await explainPlan(
      client,
      `SELECT "id" FROM "platform"."memory_embedding"
       ORDER BY "embedding" <=> $1::vector
       LIMIT 5`,
      [vectorLiteral(queryVector)],
    )
    // With sequential scans off the plan must answer through an index. The
    // HNSW index itself is asserted structurally by `db:test`.
    expect(plan.seqScans).toEqual([])
    expect(plan.indexes.length).toBeGreaterThan(0)
    console.log(`  · KNN plan indexes: ${plan.indexes.join(', ')}`)
  })
})
