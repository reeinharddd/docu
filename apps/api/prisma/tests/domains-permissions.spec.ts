// Spec — function: domains and permissions, no department reads another
// (F6 · REQUISITOS RF-06 · CASO.md #26 "un departamento no lee otro" ·
// ROLES.md matrix). Demo scripts: G4, G6.

import { beforeAll, describe, expect, test } from 'bun:test'
import { randomUUID } from 'node:crypto'
import type { Client } from 'pg'
import {
  type FacilitySeed,
  firstRow,
  getSpecDb,
  pgErrorOf,
  seedFacility,
} from './helpers/spec-db.js'

const suite = process.env.DB_TEST === '1' ? describe : describe.skip

let client: Client
let seed: FacilitySeed

async function insertPermission(code: string, name: string): Promise<string> {
  // The permission catalog is fixed and its code is unique across the engine,
  // so the insert is idempotent by code.
  const stored = await client.query<{ id: string }>(
    `INSERT INTO "core"."permission" ("id", "code", "name")
     VALUES ($1, $2, $3)
     ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name"
     RETURNING "id"`,
    [randomUUID(), code, name],
  )
  return firstRow(stored.rows).id
}

suite('domains and permissions', () => {
  beforeAll(async () => {
    client = await getSpecDb()
    seed = await seedFacility(client, 'DOM', ['programa_planeacion'])
  }, 60000)

  test('the permission catalog is closed: no invented codes', async () => {
    const error = await pgErrorOf(() => insertPermission('fly', 'Volar'))
    expect(error.code).toBe('23514')
  })

  test('the fixed catalog carries the codes the matrix needs', async () => {
    const releaseId = await insertPermission('release', 'Liberar calidad')
    const stored = await client.query<{ code: string }>(
      `SELECT "code" FROM "core"."permission" WHERE "id" = $1`,
      [releaseId],
    )
    expect(firstRow(stored.rows).code).toBe('release')
  })

  test('a role grants its permissions through role_permission', async () => {
    // The role catalog is fixed by the engine (role_code_check): the spec
    // links an existing role, it does not invent one.
    const roleId = randomUUID()
    await client.query(
      `INSERT INTO "core"."role" ("id", "code", "name", "is_system")
       VALUES ($1, 'member', 'Miembro (spec)', false)
       ON CONFLICT ("code") DO NOTHING`,
      [roleId],
    )
    const member = await client.query<{ id: string }>(
      `SELECT "id" FROM "core"."role" WHERE "code" = 'member'`,
    )
    const memberId = firstRow(member.rows).id
    const permissionId = await insertPermission('confirm', 'Confirmar dato')
    await client.query(
      `INSERT INTO "core"."role_permission" ("role_id", "permission_id")
       VALUES ($1, $2)
       ON CONFLICT ("role_id", "permission_id") DO NOTHING`,
      [memberId, permissionId],
    )
    await client.query(
      `INSERT INTO "core"."user_role" ("app_user_id", "role_id", "granted_by_id")
       VALUES ($1, $2, $3)
       ON CONFLICT ("app_user_id", "role_id") DO NOTHING`,
      [seed.supervisorId, memberId, seed.workerId],
    )
    const roles = await client.query<{ code: string }>(
      `SELECT r."code" FROM "core"."user_role" ur
       JOIN "core"."role" r ON r."id" = ur."role_id"
       WHERE ur."app_user_id" = $1`,
      [seed.supervisorId],
    )
    expect(roles.rows.map((row) => row.code)).toContain('member')
  })

  test('a grant is scoped to a domain of its facility', async () => {
    const domainId = randomUUID()
    await client.query(
      `INSERT INTO "core"."domain" ("id", "facility_id", "code", "name")
       VALUES ($1, $2, 'calidad', 'Calidad')`,
      [domainId, seed.facilityId],
    )
    await client.query(
      `INSERT INTO "core"."user_domain" ("app_user_id", "domain_id", "facility_id")
       VALUES ($1, $2, $3)`,
      [seed.workerId, domainId, seed.facilityId],
    )
    const releaseId = await insertPermission('release', 'Liberar calidad')
    const grantId = randomUUID()
    await client.query(
      `INSERT INTO "core"."access_grant"
         ("id", "facility_id", "grantee_id", "permission_id", "scope",
          "domain_id", "reason", "valid_from", "valid_until", "granted_by_id")
       VALUES ($1, $2, $3, $4, 'departamento', $5, 'Rol de calidad vigente',
               now(), now() + interval '30 days', $6)`,
      [
        grantId,
        seed.facilityId,
        seed.workerId,
        releaseId,
        domainId,
        seed.supervisorId,
      ],
    )
    const grants = await client.query<{ permission_code: string }>(
      `SELECT p."code" AS permission_code FROM "core"."access_grant" g
       JOIN "core"."permission" p ON p."id" = g."permission_id"
       WHERE g."id" = $1`,
      [grantId],
    )
    expect(firstRow(grants.rows).permission_code).toBe('release')
  })

  test('a grant without an end date is rejected (valid_until is NOT NULL)', async () => {
    const domainId = randomUUID()
    await client.query(
      `INSERT INTO "core"."domain" ("id", "facility_id", "code", "name")
       VALUES ($1, $2, 'produccion', 'Producción')`,
      [domainId, seed.facilityId],
    )
    const releaseId = await insertPermission('release', 'Liberar calidad')
    const error = await pgErrorOf(() =>
      client.query(
        `INSERT INTO "core"."access_grant"
           ("id", "facility_id", "grantee_id", "permission_id", "scope",
            "domain_id", "reason", "valid_from", "granted_by_id")
         VALUES ($1, $2, $3, $4, 'departamento', $5, 'sin vigencia', now(), $3)`,
        [randomUUID(), seed.facilityId, seed.workerId, releaseId, domainId],
      ),
    )
    expect(error.code).toBe('23502')
  })

  test('a grantee from another facility is rejected (composite FK)', async () => {
    const other = await seedFacility(client, 'DOM-C2', ['escaneado'])
    const releaseId = await insertPermission('release', 'Liberar calidad')
    const error = await pgErrorOf(() =>
      client.query(
        `INSERT INTO "core"."access_grant"
           ("id", "facility_id", "grantee_id", "permission_id", "scope",
            "reason", "valid_from", "valid_until", "granted_by_id")
         VALUES ($1, $2, $3, $4, 'instalacion', 'cruce entre plantas',
                 now(), now() + interval '1 day', $5)`,
        [
          randomUUID(),
          seed.facilityId,
          other.workerId,
          releaseId,
          seed.supervisorId,
        ],
      ),
    )
    expect(error.code).toBe('23503')
  })
})
