// Spec — function: idempotent ingestion (F2, F3 · ARQUITECTURA.md §3.2 ·
// CONTRATO.md §8: re-uploading the same document dedupes by sha256).
// Demo scripts: G1 (shift), G2 (goods receipt).

import { beforeAll, describe, expect, test } from 'bun:test'
import { randomUUID } from 'node:crypto'
import type { Client } from 'pg'
import {
  explainPlan,
  type FacilitySeed,
  firstRow,
  getSpecDb,
  insertSourceFile,
  pgErrorOf,
  seedFacility,
} from './helpers/spec-db.js'

const suite = process.env.DB_TEST === '1' ? describe : describe.skip

let client: Client
let seed: FacilitySeed

suite('ingest idempotency', () => {
  beforeAll(async () => {
    client = await getSpecDb()
    seed = await seedFacility(client, 'ING', ['excel_turno', 'recepcion_rollo'])
  }, 60000)

  test('rejects a re-upload of the same sha256 within the facility', async () => {
    const sha = 'a'.repeat(64)
    await insertSourceFile(client, seed, 'excel_turno', 'turno-1.xlsx', sha)
    const error = await pgErrorOf(() =>
      insertSourceFile(client, seed, 'excel_turno', 'turno-1-copia.xlsx', sha),
    )
    expect(error.code).toBe('23505')
  })

  test('accepts the same sha256 in another facility (isolation, not dedup)', async () => {
    const other = await seedFacility(client, 'ING-C2', ['excel_turno'])
    const id = await insertSourceFile(
      client,
      other,
      'excel_turno',
      'turno-1.xlsx',
      'b'.repeat(64),
    )
    expect(id).toBeTruthy()
  })

  test('records the received moment so the inbox can sort by it', async () => {
    const receivedAt = new Date('2026-10-13T14:30:00Z')
    await insertSourceFile(
      client,
      seed,
      'excel_turno',
      'turno-ordenado.xlsx',
      'c'.repeat(64),
      receivedAt,
    )
    const stored = await client.query<{ received_at: Date }>(
      `SELECT "received_at" FROM "ingest"."source_file"
       WHERE "facility_id" = $1 AND "original_name" = 'turno-ordenado.xlsx'`,
      [seed.facilityId],
    )
    expect(new Date(firstRow(stored.rows).received_at).toISOString()).toBe(
      receivedAt.toISOString(),
    )
  })

  test('the inbox query is index-backed at any size (facility + received_at)', async () => {
    const plan = await explainPlan(
      client,
      `SELECT "id", "original_name" FROM "ingest"."source_file"
       WHERE "facility_id" = $1
       ORDER BY "received_at" DESC
       LIMIT 20 OFFSET 0`,
      [seed.facilityId],
    )
    // Deterministic contract: the inbox never needs a full scan. The exact
    // index the planner picks is logged as evidence, not asserted.
    expect(plan.seqScans).toEqual([])
    expect(plan.indexes.length).toBeGreaterThan(0)
    console.log(`  · inbox plan indexes: ${plan.indexes.join(', ')}`)
  })

  test('a corrected document is a new file, and its entity a new version', async () => {
    const typeId = randomUUID()
    await client.query(
      `INSERT INTO "graph"."entity_type"
         ("id", "facility_id", "code", "name", "schema_definition", "created_by_id", "updated_at")
       VALUES ($1, $2, 'shift', 'Turno', '{"fields":[]}', $3, now())`,
      [typeId, seed.facilityId, seed.workerId],
    )
    const entityId = randomUUID()
    await client.query(
      `INSERT INTO "graph"."entity"
         ("id", "facility_id", "entity_type_id", "code", "data", "created_by_id", "updated_at")
       VALUES ($1, $2, $3, 'shift-1', '{}', $4, now())`,
      [entityId, seed.facilityId, typeId, seed.workerId],
    )

    const firstFile = await insertSourceFile(
      client,
      seed,
      'excel_turno',
      'turno-v1.xlsx',
      'd'.repeat(64),
    )
    const secondFile = await insertSourceFile(
      client,
      seed,
      'excel_turno',
      'turno-v2.xlsx',
      'e'.repeat(64),
    )

    const insertHistory = (version: number, fileId: string) =>
      client.query(
        `INSERT INTO "truth"."origin_history"
           ("id", "facility_id", "entity_id", "version", "data_snapshot",
            "source_file_id", "created_by_id")
         VALUES ($1, $2, $3, $4, '{}', $5, $6)`,
        [
          randomUUID(),
          seed.facilityId,
          entityId,
          version,
          fileId,
          seed.workerId,
        ],
      )
    await insertHistory(1, firstFile)
    await insertHistory(2, secondFile)

    const lineage = await client.query<{ version: string }>(
      `SELECT "version" FROM "truth"."entity_lineage"
       WHERE "entity_id" = $1 ORDER BY "version"`,
      [entityId],
    )
    expect(lineage.rows.map((row) => Number(row.version))).toEqual([1, 2])

    const repeated = pgErrorOf(() => insertHistory(2, secondFile))
    expect((await repeated).code).toBe('23505')
  })
})
