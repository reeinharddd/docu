// Spec — function: the rules of the case are DATA, never code (F1–F5 ·
// ADR-0009 · CASO.md §Reglas: R-P1..R-T1 · CONTRATO.md §7 cobertura regla ×
// familia). Demo scripts: G2, G3, G4.

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

// The seven rules of the case, verbatim from CASO.md §Reglas (2026-10-12).
const CASE_RULES = [
  {
    code: 'R-P1',
    severity: 'BLOQUEO',
    name: 'Rollo sin certificado no se programa',
  },
  {
    code: 'R-P2',
    severity: 'BLOQUEO',
    name: 'Medida distinta a la pedida no se programa',
  },
  {
    code: 'R-P3',
    severity: 'BLOQUEO',
    name: 'Material ausente en almacén bloquea la fecha',
  },
  {
    code: 'R-P4',
    severity: 'AVISO',
    name: 'Cambio de planta hermana dispara replan',
  },
  {
    code: 'R-Q1',
    severity: 'BLOQUEO',
    name: 'Solo calidad libera; producción no se auto-libera',
  },
  {
    code: 'R-A1',
    severity: 'BLOQUEO',
    name: 'Paro mayor a 30 min exige motivo',
  },
  {
    code: 'R-T1',
    severity: 'BLOQUEO',
    name: 'Stock mínimo de film o Tyvek bloquea la orden',
  },
]

let client: Client
let seed: FacilitySeed

async function insertRule(
  ruleCode: string,
  severity: string,
  appliesTo: Record<string, unknown> = {},
): Promise<string> {
  const id = randomUUID()
  await client.query(
    `INSERT INTO "config"."validation_rule"
       ("id", "facility_id", "code", "name", "severity", "expression",
        "message", "applies_to", "created_by_id", "updated_at")
     VALUES ($1, $2, $3, $4, $5, '{"field":"motivo","op":"required"}',
             $4, $6::jsonb, $7, now())`,
    [
      id,
      seed.facilityId,
      ruleCode,
      `Regla ${ruleCode}`,
      severity,
      JSON.stringify(appliesTo),
      seed.workerId,
    ],
  )
  return id
}

suite('rules as data', () => {
  beforeAll(async () => {
    client = await getSpecDb()
    seed = await seedFacility(client, 'RUL', ['excel_turno', 'escaneado'])
  }, 60000)

  test('the seven rules of the case seed as rows, with no DDL', async () => {
    for (const rule of CASE_RULES) {
      await insertRule(rule.code, rule.severity)
    }
    const stored = await client.query<{ code: string; severity: string }>(
      `SELECT "code", "severity" FROM "config"."validation_rule"
       WHERE "facility_id" = $1 ORDER BY "code"`,
      [seed.facilityId],
    )
    expect(stored.rows.map((row) => row.code)).toEqual([
      'R-A1',
      'R-P1',
      'R-P2',
      'R-P3',
      'R-P4',
      'R-Q1',
      'R-T1',
    ])
    expect(
      stored.rows.every(
        (row) => row.severity === 'BLOQUEO' || row.severity === 'AVISO',
      ),
    ).toBe(true)
  })

  test('a rule code is unique inside the facility', async () => {
    const error = await pgErrorOf(() => insertRule('R-P1', 'BLOQUEO'))
    expect(error.code).toBe('23505')
  })

  test('an unknown severity is rejected by the base, not by the code', async () => {
    const error = await pgErrorOf(() => insertRule('R-X9', 'FATAL'))
    expect(error.code).toBe('23514')
  })

  test('a rule is scoped to families through applies_to JSON, not a FK', async () => {
    await insertRule('R-A2', 'BLOQUEO', { family_code: 'excel_turno' })
    const scoped = await client.query<{ code: string }>(
      `SELECT "code" FROM "config"."validation_rule"
       WHERE "facility_id" = $1 AND "applies_to"->>'family_code' = 'excel_turno'`,
      [seed.facilityId],
    )
    expect(scoped.rows.map((row) => row.code)).toEqual(['R-A2'])
  })

  test('deactivating a rule is an UPDATE: configuration is mutable', async () => {
    const id = await insertRule('R-P5', 'AVISO')
    await client.query(
      `UPDATE "config"."validation_rule" SET "is_active" = false WHERE "id" = $1`,
      [id],
    )
    const stored = await client.query<{ is_active: boolean }>(
      `SELECT "is_active" FROM "config"."validation_rule" WHERE "id" = $1`,
      [id],
    )
    expect(firstRow(stored.rows).is_active).toBe(false)
  })

  test('a breach lands in quarantine with its rule and a reason (R-A1)', async () => {
    const fileId = await insertSourceFile(
      client,
      seed,
      'excel_turno',
      'turno-paro-sin-motivo.xlsx',
      'f'.repeat(64),
    )
    const quarantineId = randomUUID()
    await client.query(
      `INSERT INTO "ingest"."quarantine"
         ("id", "facility_id", "source_file_id", "rule_code", "severity",
          "reason", "status")
       VALUES ($1, $2, $3, 'R-A1', 'BLOQUEO',
               'Paro de 45 min sin motivo registrado', 'pending')`,
      [quarantineId, seed.facilityId, fileId],
    )
    const stored = await client.query<{
      rule_code: string
      severity: string
      reason: string
    }>(
      `SELECT "rule_code", "severity", "reason" FROM "ingest"."quarantine"
       WHERE "id" = $1`,
      [quarantineId],
    )
    expect(firstRow(stored.rows).rule_code).toBe('R-A1')
    expect(firstRow(stored.rows).severity).toBe('BLOQUEO')
    expect(firstRow(stored.rows).reason).toContain('45 min')
  })

  test('a quarantine without a reason is rejected (the why is not optional)', async () => {
    const fileId = await insertSourceFile(
      client,
      seed,
      'excel_turno',
      'turno-sin-explicacion.xlsx',
      '0'.repeat(64),
    )
    const error = await pgErrorOf(() =>
      client.query(
        `INSERT INTO "ingest"."quarantine"
           ("id", "facility_id", "source_file_id", "rule_code", "severity",
            "reason", "status")
         VALUES ($1, $2, $3, 'R-A1', 'BLOQUEO', '', 'pending')`,
        [randomUUID(), seed.facilityId, fileId],
      ),
    )
    expect(error.code).toBe('23514')
  })
})
