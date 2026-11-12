// Prueba de punta a punta de la bandeja de revisión (BRIEF #12).
//
// Arranca el `AppModule` completo contra la base scratch y comprueba el ciclo
// completo de la disposición humana: la propuesta aparece en la bandeja, se
// confirma, quedan el origen y el responsable, el dato oficial se puede leer,
// y una segunda confirmación choca (409) porque ya está disposeada.
import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { hash } from 'bcryptjs'
import type { Client } from 'pg'
import {
  type FacilitySeed,
  getSpecDb,
  seedFacility,
  specDatabaseUrl,
} from '../../prisma/tests/helpers/spec-db.js'
import { AppModule } from '../../src/app.module.js'
import { createTestApp, type TestApp } from '../helpers/http-testing.js'
import {
  applyEngineCatalog,
  grantRole,
  type ReviewProposal,
  seedReviewProposal,
} from '../helpers/review-seed.js'

const PASSWORD = 'clave-de-spec'
const FACILITY_CODE = 'e2inbox'

let client: Client
let seed: FacilitySeed
let proposal: ReviewProposal
let testApp: TestApp
let token: string

async function login(username: string): Promise<string> {
  const res = await testApp.http
    .post('/v1/auth/login')
    .send({ username, password: PASSWORD, facilityCode: FACILITY_CODE })
  expect(res.status).toBe(200)
  return res.body.token as string
}

beforeAll(async () => {
  client = await getSpecDb()
  // El catálogo de permisos y roles es el del motor: sin él nadie tiene
  // permisos y la bandeja no se puede probar.
  await applyEngineCatalog(client)
  // Cada archivo de esta corrida usa su propia instalación: el código de
  // instalación es único en toda la base.
  seed = await seedFacility(client, FACILITY_CODE, ['turno'])

  const passwordHash = await hash(PASSWORD, 4)
  for (const userId of [seed.workerId, seed.supervisorId]) {
    await client.query(
      `UPDATE "core"."app_user" SET "password_hash" = $1 WHERE "id" = $2`,
      [passwordHash, userId],
    )
  }
  // El operador confirma (rol manager); el supervisor solo lee (rol member).
  await grantRole(client, seed.workerId)
  await grantRole(
    client,
    seed.supervisorId,
    'c1000000-0000-4000-8000-000000000043',
  )

  proposal = await seedReviewProposal(client, seed)

  // El PrismaService real lee DATABASE_URL en su constructor: se apunta a la
  // base scratch antes de compilar el módulo.
  process.env.DATABASE_URL = specDatabaseUrl()
  testApp = await createTestApp({ imports: [AppModule] })
  token = await login('operador')
})

afterAll(async () => {
  await testApp?.app.close()
  // El cliente de la base scratch es compartido entre los archivos de esta
  // corrida: no se cierra aquí, se cierra con el proceso.
})

describe('GET /v1/inbox', () => {
  it('lista la propuesta en revisión de la instalación', async () => {
    const res = await testApp.http
      .get('/v1/inbox')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.headers['x-total-count']).toBe('1')
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toMatchObject({
      id: proposal.entityId,
      status: 'pending_confirmation',
      version: 1,
      entityType: { code: 'turno', name: 'Turno' },
    })
  })
})

describe('POST /v1/inbox/:id/confirm', () => {
  it('confirma el dato y deja origen, responsable y bitácora', async () => {
    const res = await testApp.http
      .post(`/v1/inbox/${proposal.entityId}/confirm`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      id: proposal.entityId,
      status: 'official',
      version: 2,
    })
    expect(typeof res.body.confirmedAt).toBe('string')

    const entity = await client.query<{
      status: string
      version: string
      confirmed_by_id: string | null
      confirmed_at: Date | null
    }>(
      `SELECT "status", "version"::text AS "version", "confirmed_by_id",
              "confirmed_at"
       FROM "graph"."entity" WHERE "id" = $1`,
      [proposal.entityId],
    )
    expect(entity.rows[0]?.status).toBe('official')
    expect(entity.rows[0]?.version).toBe('2')
    expect(entity.rows[0]?.confirmed_by_id).toBe(seed.workerId)
    expect(entity.rows[0]?.confirmed_at).toBeInstanceOf(Date)

    const history = await client.query<{
      entity_id: string
      version: string
      source_file_id: string | null
      confirmed_by_id: string | null
      data_snapshot: unknown
    }>(
      `SELECT "entity_id", "version"::text AS "version", "source_file_id",
              "confirmed_by_id", "data_snapshot"
       FROM "truth"."origin_history" WHERE "entity_id" = $1`,
      [proposal.entityId],
    )
    expect(history.rows).toHaveLength(1)
    expect(history.rows[0]?.version).toBe('2')
    expect(history.rows[0]?.source_file_id).toBe(proposal.sourceFileId)
    expect(history.rows[0]?.confirmed_by_id).toBe(seed.workerId)
    expect(history.rows[0]?.data_snapshot).toEqual({ turno: 'nocturno' })

    const audit = await client.query<{ action: string; actor_id: string }>(
      `SELECT "action", "actor_id" FROM "truth"."audit_log"
       WHERE "target_table" = 'graph.entity' AND "target_id" = $1`,
      [proposal.entityId],
    )
    expect(audit.rows).toHaveLength(1)
    expect(audit.rows[0]?.action).toBe('entity.confirmed')
    expect(audit.rows[0]?.actor_id).toBe(seed.workerId)
  })

  it('choca con 409 si la propuesta ya está disposeada', async () => {
    const res = await testApp.http
      .post(`/v1/inbox/${proposal.entityId}/confirm`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(409)
    expect(res.body.code).toBe('CONFLICT')
  })

  it('devuelve 404 si la propuesta no existe en la instalación', async () => {
    const res = await testApp.http
      .post('/v1/inbox/00000000-0000-4000-8000-000000000000/confirm')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })

  it('exige el permiso confirm (403 sin él)', async () => {
    const readerToken = await login('supervisor')

    const res = await testApp.http
      .post(`/v1/inbox/${proposal.entityId}/confirm`)
      .set('Authorization', `Bearer ${readerToken}`)

    expect(res.status).toBe(403)
  })
})

describe('GET /v1/official-records', () => {
  it('devuelve el dato confirmado con su responsable', async () => {
    const res = await testApp.http
      .get('/v1/official-records')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.headers['x-total-count']).toBe('1')
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toMatchObject({
      id: proposal.entityId,
      code: 'R-001',
      version: 2,
      entityType: { code: 'turno', name: 'Turno' },
      confirmedBy: { username: 'operador' },
      sourceFileId: proposal.sourceFileId,
    })
  })
})
