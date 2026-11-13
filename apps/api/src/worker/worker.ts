// El worker (BRIEF #3): proceso aparte que consume la cola `ingest`.
//
// La API encola, el worker procesa (ADR-0011). El worker comparte imagen con
// la API, así que su concurrencia y su memoria se fijan de forma explícita
// (COLAS.md) y no se heredan del proceso que sirve el tráfico.
//
//   bun --env-file ../../.env src/worker/worker.ts
import 'reflect-metadata'
import { Worker } from 'bullmq'
import type { IngestJob } from '../files/ingest-queue.store.js'
import { loadIaConfig } from '../ia/config.js'
import { IaRunner } from '../ia/ia-runner.js'
import { PrismaService } from '../prisma/prisma.service.js'
import { QUEUE_INGEST } from '../queues/queues.js'
import { createRedisConnection } from '../queues/redis.js'
import { workerSettingsFromEnv } from '../queues/settings.js'
import { DiskOriginalsReader } from './disk-originals-reader.js'
import { IaProposalEngine } from './ia-proposal-engine.js'
import { IngestProcessor } from './ingest.processor.js'
import { PrismaIngestPipelineStore } from './prisma-ingest-pipeline.store.js'

const settings = workerSettingsFromEnv()
const iaConfig = loadIaConfig()

const prisma = new PrismaService()
await prisma.$connect()

const processor = new IngestProcessor(
  new PrismaIngestPipelineStore(prisma),
  new DiskOriginalsReader(),
  new IaProposalEngine(new IaRunner({ config: iaConfig })),
  {
    autoThreshold: iaConfig.scoringAutoThreshold,
    reviewThreshold: iaConfig.scoringReviewThreshold,
    language: process.env.OCR_LANGUAGE ?? 'es',
  },
)

const worker = new Worker(
  QUEUE_INGEST,
  async (job) => processor.process(job.data as IngestJob),
  {
    connection: createRedisConnection(),
    concurrency: settings.concurrency,
    lockDuration: settings.lockMs,
  },
)

worker.on('failed', (job, error) => {
  console.error(
    `[worker] job ${job?.id ?? '?'} falló: ${error instanceof Error ? error.message : String(error)}`,
  )
})
worker.on('completed', (job) => {
  console.log(`[worker] job ${job.id} terminado`)
})

console.log(
  `[worker] escuchando la cola ${QUEUE_INGEST} (concurrencia ${settings.concurrency}, ` +
    `reintentos ${settings.attempts}, umbrales ${iaConfig.scoringAutoThreshold}/${iaConfig.scoringReviewThreshold})`,
)

const shutdown = async () => {
  await worker.close()
  await prisma.$disconnect()
  process.exit(0)
}
process.on('SIGTERM', () => void shutdown())
process.on('SIGINT', () => void shutdown())
