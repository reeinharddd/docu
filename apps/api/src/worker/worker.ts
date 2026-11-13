// El worker (BRIEF #3, #46): proceso aparte que consume las colas de C1.
//
// La API encola, el worker procesa (ADR-0011). El worker comparte imagen con
// la API, así que su concurrencia y su memoria se fijan de forma explícita
// (COLAS.md) y no se heredan del proceso que sirve el tráfico.
//
//   bun --env-file ../../.env src/worker/worker.ts
//
// Cada cola tiene su conexión a Redis: BullMQ bloquea la conexión del worker
// mientras un job corre, y una conexión por cola evita que una cola lenta
// atasque a las demás. El worker publica su latido en Redis y la API lo lee
// en `/health`.
import 'reflect-metadata'
import { Queue, Worker } from 'bullmq'
import { loadIaConfig } from '../ia/config.js'
import { IaRunner } from '../ia/ia-runner.js'
import { PrismaService } from '../prisma/prisma.service.js'
import { depthOf } from '../queues/depth.js'
import type { QueueDepth } from '../queues/heartbeat.js'
import { startHeartbeat } from '../queues/heartbeat-loop.js'
import type { IngestPayload } from '../queues/ingest-payload.js'
import { QUEUE_INGEST, type QueueName } from '../queues/queues.js'
import { createRedisConnection } from '../queues/redis.js'
import { QUEUE_DEFINITIONS } from '../queues/registry.js'
import { workerSettingsFromEnv } from '../queues/settings.js'
import { DiskOriginalsReader } from './disk-originals-reader.js'
import { IaProposalEngine } from './ia-proposal-engine.js'
import { IngestProcessor } from './ingest.processor.js'
import { PrismaIngestPipelineStore } from './prisma-ingest-pipeline.store.js'
import { quarantineExhaustedJob } from './quarantine-on-failure.js'

const settings = workerSettingsFromEnv()
const iaConfig = loadIaConfig()

const prisma = new PrismaService()
await prisma.$connect()

const store = new PrismaIngestPipelineStore(prisma)
const processor = new IngestProcessor(
  store,
  new DiskOriginalsReader(),
  new IaProposalEngine(new IaRunner({ config: iaConfig })),
  {
    autoThreshold: iaConfig.scoringAutoThreshold,
    reviewThreshold: iaConfig.scoringReviewThreshold,
    language: process.env.OCR_LANGUAGE ?? 'es',
  },
)

// Una conexión por cola: se usan para leer la profundidad y, en la cola que
// este proceso consume, para el worker.
const queues = new Map<QueueName, Queue>()
const connections: Array<{ quit: () => Promise<string> }> = []
for (const definition of QUEUE_DEFINITIONS) {
  const connection = createRedisConnection()
  connection.on('error', (error: Error) => {
    console.error(`[worker] redis (${definition.name}): ${error.message}`)
  })
  connections.push(connection)
  queues.set(definition.name, new Queue(definition.name, { connection }))
}

async function depths(): Promise<Record<string, QueueDepth>> {
  const out: Record<string, QueueDepth> = {}
  for (const [name, queue] of queues) {
    out[name] = await depthOf(queue)
  }
  return out
}

// El latido: la API lo lee en `/health`. Si el worker muere, la clave expira
// y la salud lo dice en vez de fingir que todo está bien.
const heartbeatConnection = createRedisConnection()
heartbeatConnection.on('error', (error: Error) => {
  console.error(`[worker] redis (latido): ${error.message}`)
})
const heartbeat = startHeartbeat({
  redis: heartbeatConnection,
  depths,
  intervalMs: settings.heartbeatMs,
  ttlMs: settings.heartbeatTtlMs,
  onError: (error: unknown) => {
    console.error(
      `[worker] no se pudo publicar el latido: ${error instanceof Error ? error.message : String(error)}`,
    )
  },
})

// Solo la cola `ingest` tiene procesador en este proceso. Las otras tres
// quedan declaradas y con su profundidad visible, y sus procesadores llegan
// con sus issues (#39 para `reports` y `alerts`).
const worker = new Worker(
  QUEUE_INGEST,
  async (job) => processor.process(job.id ?? '', job.data as IngestPayload),
  {
    connection: createRedisConnection(),
    concurrency: settings.concurrency,
    lockDuration: settings.lockMs,
  },
)

worker.on('failed', (job, error) => {
  const reason = error instanceof Error ? error.message : String(error)
  console.error(`[worker] job ${job?.id ?? '?'} falló: ${reason}`)
  if (!job) {
    return
  }
  void quarantineExhaustedJob(store, {
    sourceFileId: (job.data as IngestPayload).sourceFileId,
    attemptsMade: job.attemptsMade,
    maxAttempts: job.opts.attempts ?? 1,
    error: reason,
  }).catch((failure: unknown) => {
    console.error(
      `[worker] no se pudo escribir la cuarentena: ${failure instanceof Error ? failure.message : String(failure)}`,
    )
  })
})
worker.on('completed', (job) => {
  console.log(`[worker] job ${job.id} terminado`)
})

await heartbeat.beat()

console.log(
  `[worker] escuchando ${[...queues.keys()].join(', ')} ` +
    `(consume ${QUEUE_INGEST}; concurrencia ${settings.concurrency}, ` +
    `reintentos ${settings.attempts}, jitter ${settings.backoffJitter})`,
)

const shutdown = async () => {
  heartbeat.stop()
  // El cierre no puede colgarse: un worker vivo que no termina roba los
  // jobs de la cola y deja el sistema a medias.
  const forced = setTimeout(() => process.exit(1), 5000)
  try {
    await worker.close()
    for (const queue of queues.values()) {
      await queue.close()
    }
    for (const connection of connections) {
      await connection.quit()
    }
    await heartbeatConnection.quit()
    await prisma.$disconnect()
  } catch (error) {
    console.error(
      `[worker] cierre con errores: ${error instanceof Error ? error.message : String(error)}`,
    )
  } finally {
    clearTimeout(forced)
    process.exit(0)
  }
}
process.on('SIGTERM', () => void shutdown())
process.on('SIGINT', () => void shutdown())
