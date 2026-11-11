// Spec — function: the platform holds the volume of the contract and answers
// its hot queries from indexes (CONTRATO.md §8: one month, 60 shifts, the
// six families · CASO.md F6 "¿de qué rollo salió esta orden?" · G1–G6).

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

// CONTRATO.md §8 — files per family for the simulated month.
const VOLUME: Array<[string, number]> = [
  ['excel_turno', 120],
  ['recepcion_rollo', 14],
  ['programa_planeacion', 2],
  ['inventario', 2],
  ['correo_hermana', 16],
  ['escaneado', 16],
]
const SHIFTS = 60 // 20 business days × 3 shifts

let client: Client
let seed: FacilitySeed

async function bulkInsertMonth(): Promise<void> {
  const familyIds: Record<string, string> = {}
  for (const [family] of VOLUME) {
    const familyId = randomUUID()
    await client.query(
      `INSERT INTO "config"."family_config"
         ("id", "facility_id", "family_code", "name", "schema_definition",
          "parser_key", "is_ocr_required", "created_by_id", "updated_at")
       VALUES ($1, $2, $3, $4, '{"fields":[]}', 'spec.v1', false, $5, now())`,
      [familyId, seed.facilityId, family, `Spec ${family}`, seed.workerId],
    )
    familyIds[family] = familyId
  }

  // 170 files spread over the month window (2026-10-05 → 2026-10-30).
  for (const [family, count] of VOLUME) {
    await client.query(
      `INSERT INTO "ingest"."source_file"
         ("id", "facility_id", "family_config_id", "original_name", "sha256",
          "mime_type", "byte_size", "storage_path", "received_at", "received_by_id")
       SELECT
         gen_random_uuid(), $1, $2,
         $3 || '-' || g || '.pdf',
         md5($3 || '-' || g),
         'application/pdf', 4096,
         'originales/' || $3 || '-' || g || '.pdf',
         TIMESTAMPTZ '2026-10-05 06:00:00-06' + ((g - 1) * interval '3 hours'),
         $4
       FROM generate_series(1, $5) AS g`,
      [seed.facilityId, familyIds[family], family, seed.workerId, count],
    )
  }

  // Entity types of the case vocabulary (English identifiers, repo rule).
  const types: Record<string, string> = {}
  for (const code of ['shift', 'roll', 'production_order', 'scrap_event']) {
    const id = randomUUID()
    types[code] = id
    await client.query(
      `INSERT INTO "graph"."entity_type"
         ("id", "facility_id", "code", "name", "schema_definition", "created_by_id", "updated_at")
       VALUES ($1, $2, $3, $4, '{"fields":[]}', $5, now())`,
      [id, seed.facilityId, code, `Tipo ${code}`, seed.workerId],
    )
  }

  // 60 shifts with their machine, across the month.
  await client.query(
    `INSERT INTO "graph"."entity"
       ("id", "facility_id", "entity_type_id", "code", "data", "created_by_id", "updated_at")
     SELECT
       gen_random_uuid(), $1, $2,
       'shift-' || g,
       jsonb_build_object('machine', CASE WHEN g % 2 = 0 THEN 'TP-02' ELSE 'TP-01' END,
                          'day', 5 + ((g - 1) / 3)),
       $3, now()
     FROM generate_series(1, $4) AS g`,
    [seed.facilityId, types.shift, seed.workerId, SHIFTS],
  )

  // 14 rolls and 14 production orders, each roll consumed by one order
  // (the lineage question of F6).
  await client.query(
    `INSERT INTO "graph"."entity"
       ("id", "facility_id", "entity_type_id", "code", "data", "created_by_id", "updated_at")
     SELECT gen_random_uuid(), $1, $2, 'roll-' || g, '{}', $3, now()
     FROM generate_series(1, 14) AS g`,
    [seed.facilityId, types.roll, seed.workerId],
  )
  await client.query(
    `INSERT INTO "graph"."entity"
       ("id", "facility_id", "entity_type_id", "code", "data", "created_by_id", "updated_at")
     SELECT gen_random_uuid(), $1, $2, 'order-' || g, '{}', $3, now()
     FROM generate_series(1, 14) AS g`,
    [seed.facilityId, types.production_order, seed.workerId],
  )
  await client.query(
    `INSERT INTO "graph"."relation"
       ("id", "facility_id", "source_entity_id", "target_entity_id",
        "relation_type", "created_by_id")
     SELECT gen_random_uuid(), $1, r."id", o."id", 'material_for', $2
     FROM "graph"."entity" r
     JOIN "graph"."entity" o
       ON o."facility_id" = r."facility_id"
      AND o."code" = replace(r."code", 'roll-', 'order-')
     WHERE r."facility_id" = $1 AND r."code" LIKE 'roll-%'`,
    [seed.facilityId, seed.workerId],
  )

  // One embedding per shift: the semantic layer at contract scale.
  await client.query(
    `INSERT INTO "platform"."memory_embedding"
       ("id", "facility_id", "entity_id", "chunk", "embedding", "model")
     SELECT
       gen_random_uuid(), $1, e."id", 'turno',
       ('[' || array_to_string(array(
         SELECT round(random()::numeric, 4)::text FROM generate_series(1, 768)
       ), ',') || ']')::vector,
       'spec-embedding'
     FROM "graph"."entity" e
     WHERE e."facility_id" = $1 AND e."code" LIKE 'shift-%'`,
    [seed.facilityId],
  )
}

suite('contract volume', () => {
  beforeAll(async () => {
    client = await getSpecDb()
    seed = await seedFacility(client, 'VOL', [])
    await bulkInsertMonth()
  }, 120000)

  test('the month holds the file volume of every family', async () => {
    const counts = await client.query<{ family_code: string; files: string }>(
      `SELECT fc."family_code", count(sf."id")::text AS files
       FROM "config"."family_config" fc
       LEFT JOIN "ingest"."source_file" sf
         ON sf."family_config_id" = fc."id" AND sf."facility_id" = fc."facility_id"
       WHERE fc."facility_id" = $1
       GROUP BY fc."family_code" ORDER BY fc."family_code"`,
      [seed.facilityId],
    )
    const byFamily = Object.fromEntries(
      counts.rows.map((row) => [row.family_code, Number(row.files)]),
    )
    for (const [family, count] of VOLUME) {
      expect(byFamily[family]).toBe(count)
    }
  })

  test('the 60 shifts of the month exist as entities', async () => {
    const stored = await client.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM "graph"."entity" e
       JOIN "graph"."entity_type" t
         ON t."id" = e."entity_type_id" AND t."facility_id" = e."facility_id"
       WHERE e."facility_id" = $1 AND t."code" = 'shift'`,
      [seed.facilityId],
    )
    expect(Number(firstRow(stored.rows).count)).toBe(SHIFTS)
  })

  test('every order traces back to its roll (the F6 lineage question)', async () => {
    const traced = await client.query<{
      order_code: string
      roll_code: string
    }>(
      `SELECT o."code" AS order_code, r."code" AS roll_code
       FROM "graph"."relation" rel
       JOIN "graph"."entity" r
         ON r."id" = rel."source_entity_id" AND r."facility_id" = rel."facility_id"
       JOIN "graph"."entity" o
         ON o."id" = rel."target_entity_id" AND o."facility_id" = rel."facility_id"
       WHERE rel."facility_id" = $1 AND rel."relation_type" = 'material_for'
       ORDER BY o."code" LIMIT 5`,
      [seed.facilityId],
    )
    expect(traced.rows).toHaveLength(5)
    for (const row of traced.rows) {
      expect(row.roll_code).toBe(row.order_code.replace('order-', 'roll-'))
    }
  })

  test('a duplicate roll→order relation is rejected', async () => {
    const error = await pgErrorOf(() =>
      client.query(
        `INSERT INTO "graph"."relation"
           ("id", "facility_id", "source_entity_id", "target_entity_id",
            "relation_type", "created_by_id")
         SELECT gen_random_uuid(), "facility_id", "source_entity_id",
                "target_entity_id", "relation_type", "created_by_id"
         FROM "graph"."relation"
         WHERE "facility_id" = $1 AND "relation_type" = 'material_for'
         LIMIT 1`,
        [seed.facilityId],
      ),
    )
    expect(error.code).toBe('23505')
  })

  test('the inbox page is index-backed at contract volume', async () => {
    const plan = await explainPlan(
      client,
      `SELECT "id", "original_name", "received_at" FROM "ingest"."source_file"
       WHERE "facility_id" = $1
       ORDER BY "received_at" DESC
       LIMIT 20 OFFSET 40`,
      [seed.facilityId],
    )
    expect(plan.seqScans).toEqual([])
    console.log(`  · inbox at volume, indexes: ${plan.indexes.join(', ')}`)
  })

  test('the lineage lookup is index-backed at contract volume', async () => {
    const plan = await explainPlan(
      client,
      `SELECT h."version", h."data_snapshot"
       FROM "truth"."entity_lineage" h
       WHERE h."facility_id" = $1 AND h."entity_code" = 'shift-1'
       ORDER BY h."version"`,
      [seed.facilityId],
    )
    expect(plan.seqScans).toEqual([])
    console.log(`  · lineage at volume, indexes: ${plan.indexes.join(', ')}`)
  })

  test('the semantic lookup is index-backed at contract volume', async () => {
    const queryVector = Array.from(
      { length: 768 },
      (_value, index) => (index % 9) * 0.03,
    )
    const plan = await explainPlan(
      client,
      `SELECT "id" FROM "platform"."memory_embedding"
       ORDER BY "embedding" <=> $1::vector
       LIMIT 5`,
      [vectorLiteral(queryVector)],
    )
    expect(plan.seqScans).toEqual([])
    console.log(`  · KNN at volume, indexes: ${plan.indexes.join(', ')}`)
  })

  test('the hot queries answer in the order of milliseconds (evidence, not gate)', async () => {
    const started = performance.now()
    await client.query(
      `SELECT "id" FROM "ingest"."source_file"
       WHERE "facility_id" = $1 ORDER BY "received_at" DESC LIMIT 20`,
      [seed.facilityId],
    )
    const elapsed = performance.now() - started
    console.log(`  · inbox page at contract volume: ${elapsed.toFixed(1)} ms`)
    expect(elapsed).toBeLessThan(2000)
  })
})
