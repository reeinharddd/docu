// Prueba de punta a punta del pipeline (BRIEF #3).
//
// La vertical mínima del entregable, en una sola prueba: subir un archivo →
// la API lo registra y encola → el worker lo procesa y propone → la propuesta
// llega a la bandeja → una persona confirma → el dato oficial existe.
//
// Redis y PostgreSQL son reales; los motores de IA son dobles (el OCR de
// verdad necesita el modelo local, que es de otra máquina).
import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { hash } from 'bcryptjs'
import { QueueEvents, Worker } from 'bullmq'
import type { Client } from 'pg'
import {
  type FacilitySeed,
  getSpecDb,
  seedFacility,
  specDatabaseUrl,
} from '../../prisma/tests/helpers/spec-db.js'
import { AppModule } from '../../src/app.module.js'
import { PrismaService } from '../../src/prisma/prisma.service.js'
import { QUEUE_INGEST } from '../../src/queues/queues.js'
import { createRedisConnection } from '../../src/queues/redis.js'
import { DiskOriginalsReader } from '../../src/worker/disk-originals-reader.js'
import { IngestProcessor } from '../../src/worker/ingest.processor.js'
import { PrismaIngestPipelineStore } from '../../src/worker/prisma-ingest-pipeline.store.js'
import type { ProposalEngine } from '../../src/worker/proposal-engine.js'
import { createTestApp, type TestApp } from '../helpers/http-testing.js'
import { applyEngineCatalog, grantRole } from '../helpers/review-seed.js'

const PASSWORD = 'clave-de-spec'
const FAMILY_CODE = 'excel_turno'
const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

let client: Client
let seed: FacilitySeed
let testApp: TestApp
let worker: Worker
let events: QueueEvents
let prisma: PrismaService
let token: string

// El modelo es un doble: el OCR de verdad (GLM-OCR local) no está en esta
// máquina y la máquina de propuesta (Laya) tampoco. Lo que se prueba aquí es
// el pipeline, no el motor.
const fakeEngine: ProposalEngine = {
  recognize: async () => ({ text: 'TURNO T1\nbuenas 100\nparo 0' }),
  classify: async () => ({ label: FAMILY_CODE, confidence: 0.95 }),
  mapFields: async () => ({ turno_id: 'T1', cantidad_buena: 100 }),
}

beforeAll(async () => {
  // Los originales del spec van a un directorio temporal: `originales/` del
  // repo es de solo lectura (REGLAS.md 5).
  process.env.ORIGINALS_DIR = await mkdtemp(join(tmpdir(), 'docu-originals-'))

  client = await getSpecDb()
  await applyEngineCatalog(client)
  seed = await seedFacility(client, 'e2worker', [FAMILY_CODE])
  const passwordHash = await hash(PASSWORD, 4)
  await client.query(
    `UPDATE "core"."app_user" SET "password_hash" = $1 WHERE "id" = $2`,
    [passwordHash, seed.workerId],
  )
  await grantRole(client, seed.workerId)

  // La familia declara el tipo de entidad que propone y sus campos: los
  // datos son de la instalación (ADR-0019) y el mapeo sale de su esquema.
  await client.query(
    `UPDATE "config"."family_config"
     SET "schema_definition" = '{"entityType":"document","fields":[{"name":"turno_id","type":"string"},{"name":"cantidad_buena","type":"number"}]}'::jsonb
     WHERE "id" = $1`,
    [seed.familyIds[FAMILY_CODE]],
  )
  await client.query(
    `INSERT INTO "graph"."entity_type"
       ("id", "facility_id", "code", "name", "schema_definition", "is_system",
        "is_active", "created_by_id", "updated_at")
     VALUES (gen_random_uuid(), $1, 'document', 'Documento', '{"fields":[]}',
             false, true, $2, now())`,
    [seed.facilityId, seed.workerId],
  )

  process.env.DATABASE_URL = specDatabaseUrl()
  testApp = await createTestApp({ imports: [AppModule] })

  const login = await testApp.http.post('/v1/auth/login').send({
    username: 'operador',
    password: PASSWORD,
    facilityCode: 'e2worker',
  })
  expect(login.status).toBe(200)
  token = login.body.token as string

  // El worker real de BullMQ, con el pipeline real y la IA doblada.
  prisma = new PrismaService()
  await prisma.$connect()
  const processor = new IngestProcessor(
    new PrismaIngestPipelineStore(prisma),
    new DiskOriginalsReader(),
    fakeEngine,
    { autoThreshold: 0.9, reviewThreshold: 0.6, language: 'es' },
  )
  events = new QueueEvents(QUEUE_INGEST, {
    connection: createRedisConnection(),
  })
  await events.waitUntilReady()
  worker = new Worker(
    QUEUE_INGEST,
    async (job) => processor.process(job.data),
    { connection: createRedisConnection(), concurrency: 1 },
  )
  await worker.waitUntilReady()
})

afterAll(async () => {
  await worker?.close()
  await events?.close()
  await prisma?.$disconnect()
  await testApp?.app.close()
  // El cliente de la base scratch es compartido entre los archivos de esta
  // corrida: no se cierra aquí, se cierra con el proceso.
})

describe('pipeline de ingesta', () => {
  it('sube, encola, propone, manda a la bandeja y publica con confirmación humana', async () => {
    const finished = new Promise<void>((resolve, reject) => {
      events.once('completed', () => resolve())
      events.once('failed', (_jobId, error) =>
        reject(new Error(`el job falló: ${error}`)),
      )
    })

    const upload = await testApp.http
      .post('/v1/files')
      .set('Authorization', `Bearer ${token}`)
      .field('familyCode', FAMILY_CODE)
      .attach('file', Buffer.from('contenido del turno'), {
        filename: 'turno.xlsx',
        contentType: XLSX_MIME,
      })

    expect(upload.status).toBe(201)
    const sourceFileId = upload.body.sourceFileId as string

    // El trabajo quedó registrado y encolado, con el mismo id en los dos lados.
    const job = await client.query<{ status: string; queue: string }>(
      `SELECT "status", "queue" FROM "platform"."job_run" WHERE "job_id" = $1`,
      [sourceFileId],
    )
    expect(job.rows[0]?.queue).toBe('ingest')
    expect(job.rows[0]?.status).toBe('queued')

    await finished

    // El worker propuso: la propuesta llega a la bandeja.
    const proposal = await client.query<{
      id: string
      status: string
      version: string
      data: unknown
    }>(
      `SELECT "id", "status", "version"::text AS "version", "data"
       FROM "graph"."entity" WHERE "source_file_id" = $1`,
      [sourceFileId],
    )
    expect(proposal.rows).toHaveLength(1)
    expect(proposal.rows[0]?.status).toBe('pending_confirmation')
    expect(proposal.rows[0]?.version).toBe('1')
    expect(proposal.rows[0]?.data).toEqual({
      turno_id: 'T1',
      cantidad_buena: 100,
    })

    const parsed = await client.query<{ status: string }>(
      `SELECT "status" FROM "ingest"."parsed_record" WHERE "source_file_id" = $1`,
      [sourceFileId],
    )
    expect(parsed.rows[0]?.status).toBe('parsed')

    const ocr = await client.query<{ text_content: string }>(
      `SELECT "text_content" FROM "ingest"."ocr_result" WHERE "source_file_id" = $1`,
      [sourceFileId],
    )
    expect(ocr.rows[0]?.text_content).toContain('TURNO T1')

    const done = await client.query<{ status: string }>(
      `SELECT "status" FROM "platform"."job_run" WHERE "job_id" = $1`,
      [sourceFileId],
    )
    expect(done.rows[0]?.status).toBe('done')

    // La bandeja muestra la propuesta.
    const inbox = await testApp.http
      .get('/v1/inbox')
      .set('Authorization', `Bearer ${token}`)
    expect(inbox.status).toBe(200)
    expect(inbox.body).toHaveLength(1)

    // La persona confirma: el dato oficial existe con su origen y su responsable.
    const confirm = await testApp.http
      .post(`/v1/inbox/${proposal.rows[0]?.id}/confirm`)
      .set('Authorization', `Bearer ${token}`)
    expect(confirm.status).toBe(200)
    expect(confirm.body.status).toBe('official')

    const official = await testApp.http
      .get('/v1/official-records')
      .set('Authorization', `Bearer ${token}`)
    expect(official.status).toBe(200)
    expect(official.body).toHaveLength(1)
    // El código de la entidad es el sha256 del original: el contenido es la
    // identidad del documento.
    expect(official.body[0].code).toBe(upload.body.sha256)
    expect(official.body[0].confirmedBy.username).toBe('operador')
  })
})
