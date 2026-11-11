// Spec — function: confirmation cascade of the official datum (F3, F4 ·
// IA.md §3 cascade · CASO.md R-Q1: only quality releases; a human always
// confirms · ADR-0006: IA proposes, human disposes). Demo scripts: G3, G4.

import { beforeAll, describe, expect, test } from 'bun:test'
import { randomUUID } from 'node:crypto'
import type { Client } from 'pg'
import {
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

async function insertEntityType(code: string): Promise<string> {
  const stored = await client.query<{ id: string }>(
    `INSERT INTO "graph"."entity_type"
       ("id", "facility_id", "code", "name", "schema_definition", "created_by_id", "updated_at")
     VALUES ($1, $2, $3, $4, '{"fields":[]}', $5, now())
     ON CONFLICT ("facility_id", "code")
     DO UPDATE SET "name" = EXCLUDED."name", "updated_at" = now()
     RETURNING "id"`,
    [randomUUID(), seed.facilityId, code, `Tipo ${code}`, seed.workerId],
  )
  return firstRow(stored.rows).id
}

async function insertEntity(typeId: string, code: string): Promise<string> {
  const id = randomUUID()
  await client.query(
    `INSERT INTO "graph"."entity"
       ("id", "facility_id", "entity_type_id", "code", "data", "created_by_id", "updated_at")
     VALUES ($1, $2, $3, $4, '{}', $5, now())`,
    [id, seed.facilityId, typeId, code, seed.workerId],
  )
  return id
}

suite('confirmation cascade', () => {
  beforeAll(async () => {
    client = await getSpecDb()
    seed = await seedFacility(client, 'CAS', ['escaneado'])
  }, 60000)

  test('an entity is born as draft: nobody has confirmed anything yet', async () => {
    const typeId = await insertEntityType('roll')
    const entityId = await insertEntity(typeId, 'roll-ghost')
    const stored = await client.query<{
      status: string
      confirmed_by_id: string | null
    }>(
      `SELECT "status", "confirmed_by_id" FROM "graph"."entity" WHERE "id" = $1`,
      [entityId],
    )
    expect(firstRow(stored.rows).status).toBe('draft')
    expect(firstRow(stored.rows).confirmed_by_id).toBeNull()
  })

  test('a draft cannot carry a confirmation (no premature confirmation)', async () => {
    const typeId = await insertEntityType('roll')
    const entityId = await insertEntity(typeId, 'roll-prematuro')
    const error = await pgErrorOf(() =>
      client.query(
        `UPDATE "graph"."entity"
         SET "confirmed_by_id" = $1, "confirmed_at" = now()
         WHERE "id" = $2`,
        [seed.supervisorId, entityId],
      ),
    )
    expect(error.code).toBe('23514')
  })

  test('official without a confirmed_by is rejected by the base', async () => {
    const typeId = await insertEntityType('roll')
    const entityId = await insertEntity(typeId, 'roll-sin-responsable')
    const error = await pgErrorOf(() =>
      client.query(
        `UPDATE "graph"."entity" SET "status" = 'official' WHERE "id" = $1`,
        [entityId],
      ),
    )
    expect(error.code).toBe('23514')
  })

  test('draft -> official requires who AND when, then the view exposes it', async () => {
    const typeId = await insertEntityType('roll')
    const entityId = await insertEntity(typeId, 'roll-liberado')
    await client.query(
      `UPDATE "graph"."entity"
       SET "status" = 'official', "confirmed_by_id" = $1, "confirmed_at" = now()
       WHERE "id" = $2`,
      [seed.supervisorId, entityId],
    )
    const official = await client.query<{
      code: string
      confirmed_by_username: string
    }>(
      `SELECT "code", "confirmed_by_username" FROM "truth"."official_record"
       WHERE "facility_id" = $1 AND "id" = $2`,
      [seed.facilityId, entityId],
    )
    expect(firstRow(official.rows).code).toBe('roll-liberado')
    expect(firstRow(official.rows).confirmed_by_username).toBe('supervisor')

    // The view is the contract of the official datum: drafts never leak in.
    const codes = await client.query<{ code: string }>(
      `SELECT "code" FROM "truth"."official_record" WHERE "facility_id" = $1`,
      [seed.facilityId],
    )
    expect(codes.rows.every((row) => row.code !== 'roll-ghost')).toBe(true)
  })

  test('each published version is recorded with its rule and its source', async () => {
    const typeId = await insertEntityType('quality_release')
    const entityId = await insertEntity(typeId, 'qa-lote-2610')
    const fileId = await insertSourceFile(
      client,
      seed,
      'escaneado',
      'hoja-verificacion.pdf',
      '1'.repeat(64),
    )
    await client.query(
      `INSERT INTO "truth"."origin_history"
         ("id", "facility_id", "entity_id", "version", "data_snapshot",
          "source_file_id", "rule_code", "rule_severity", "confirmed_by_id",
          "created_by_id")
       VALUES ($1, $2, $3, 1, '{"lote":"2610"}', $4, 'R-Q1', 'BLOQUEO', $5, $6)`,
      [
        randomUUID(),
        seed.facilityId,
        entityId,
        fileId,
        seed.supervisorId,
        seed.workerId,
      ],
    )
    await client.query(
      `UPDATE "graph"."entity"
       SET "status" = 'official', "confirmed_by_id" = $1, "confirmed_at" = now(),
           "source_file_id" = $2
       WHERE "id" = $3`,
      [seed.supervisorId, fileId, entityId],
    )

    const lineage = await client.query<{
      rule_code: string | null
      source_name: string
      entity_status: string
    }>(
      `SELECT "rule_code", "source_name", "entity_status" FROM "truth"."entity_lineage"
       WHERE "facility_id" = $1 AND "entity_id" = $2`,
      [seed.facilityId, entityId],
    )
    expect(lineage.rows).toHaveLength(1)
    expect(firstRow(lineage.rows).rule_code).toBe('R-Q1')
    expect(firstRow(lineage.rows).source_name).toBe('hoja-verificacion.pdf')
    expect(firstRow(lineage.rows).entity_status).toBe('official')
  })

  test('an entity code is unique per facility and type', async () => {
    const typeId = await insertEntityType('roll')
    await insertEntity(typeId, 'roll-duplicado')
    const error = await pgErrorOf(() => insertEntity(typeId, 'roll-duplicado'))
    expect(error.code).toBe('23505')
  })
})
