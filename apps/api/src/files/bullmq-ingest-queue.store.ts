// Adaptador BullMQ de la cola de ingesta (BRIEF #3).
//
// El `jobId` del job de Redis es el mismo que el de la fila de
// `platform.job_run`: una corrida, una fila, y el worker reencola lo que
// quedó a medias (ARQUITECTURA.md §3.2).
//
// La conexión se abre la primera vez que se encola, no al arrancar: la API
// tiene que poder servir `/health` y las lecturas sin Redis (y el job de
// `guardas` en CI no lo tiene).
import { Injectable, type OnModuleDestroy } from '@nestjs/common'
import { Queue } from 'bullmq'
import type { Redis } from 'ioredis'
import { QUEUE_INGEST } from '../queues/queues.js'
import { createRedisConnection } from '../queues/redis.js'
import { queueSettingsFromEnv } from '../queues/settings.js'
import { type IngestJob, type IngestQueue } from './ingest-queue.store.js'

@Injectable()
export class BullMqIngestQueue implements IngestQueue, OnModuleDestroy {
  private queue: Queue | null = null
  private connection: Redis | null = null

  private getQueue(): Queue {
    if (!this.queue) {
      this.connection = createRedisConnection()
      // Sin oyente, ioredis deja el error como evento no manejado y tumba el
      // proceso; aquí se registra y la API sigue sirviendo.
      this.connection.on('error', (error: Error) => {
        console.error(`[api] redis: ${error.message}`)
      })
      this.queue = new Queue(QUEUE_INGEST, { connection: this.connection })
    }
    return this.queue
  }

  async enqueue(job: IngestJob): Promise<void> {
    const settings = queueSettingsFromEnv()
    await this.getQueue().add(
      'ingest',
      {
        sourceFileId: job.sourceFileId,
        sha256: job.sha256,
        familyCode: job.familyCode,
      },
      {
        jobId: job.jobId,
        attempts: settings.attempts,
        // El jitter dispersa los reintentos: sin él, todos los jobs que
        // fallan juntos vuelven a fallar juntos (BRIEF #46).
        backoff: {
          type: 'exponential',
          delay: settings.backoffMs,
          jitter: settings.backoffJitter,
        },
        // La corrida terminada no ocupa Redis; la fallida se queda para mirar.
        removeOnComplete: true,
        removeOnFail: false,
      },
    )
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue?.close()
    await this.connection?.quit()
  }
}
