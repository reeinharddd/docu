// Sondas de la puerta de salud (ARQUITECTURA.md §1).
//
// Cada sonda responde con su estado y nunca lanza: la puerta tiene que decir
// qué segmento falló, no fallar con un error opaco.
import { Redis } from 'ioredis'
import { Client } from 'pg'
import { readHeartbeat } from '../queues/heartbeat.js'
import { createProbeConnection } from '../queues/redis.js'
import { HealthReportDto, WorkerHealthDto } from './health-report.dto.js'

export type ProbeState = 'up' | 'down'

/** El worker y su profundidad por cola: el DTO es la forma publicada. */
export type WorkerHealth = WorkerHealthDto

/** El reporte completo de la puerta: el DTO es la forma publicada. */
export type HealthReport = HealthReportDto

export async function probePostgres(
  connectionString: string | undefined = process.env.DATABASE_URL,
): Promise<ProbeState> {
  const db = new Client(connectionString ? { connectionString } : {})
  try {
    await db.connect()
    await db.query('SELECT 1')
    return 'up'
  } catch {
    return 'down'
  } finally {
    await db.end().catch(() => undefined)
  }
}

export async function probeRedis(
  url: string = process.env.REDIS_URL ?? 'redis://localhost:6379',
): Promise<ProbeState> {
  const redis = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  })
  // Sin oyente, ioredis deja el error como evento no manejado y ensucia la
  // salida de la puerta (que es la que mira la gente cuando algo falla).
  redis.on('error', () => undefined)
  try {
    const pong = await redis.ping()
    return pong === 'PONG' ? 'up' : 'down'
  } catch {
    return 'down'
  } finally {
    redis.disconnect()
  }
}

/**
 * El worker vive si su latido está en Redis. La sonda abre su propia
 * conexión y la cierra: la salud no depende de ninguna conexión viva.
 */
export async function probeWorker(
  url: string = process.env.REDIS_URL ?? 'redis://localhost:6379',
): Promise<WorkerHealth> {
  const redis = createProbeConnection(url)
  redis.on('error', () => undefined)
  try {
    const heartbeat = await readHeartbeat(redis)
    if (!heartbeat) {
      return { alive: false, queues: {} }
    }
    return { alive: true, queues: heartbeat.queues }
  } catch {
    return { alive: false, queues: {} }
  } finally {
    redis.disconnect()
  }
}

/**
 * All up -> ok. Any segment down -> degraded. The gate decides the status
 * code from this report, so the rule lives in one testable place.
 *
 * The worker is a segment of the system: if it is not alive there is nobody
 * processing the queue, and a gate that answers 200 while that is true lies
 * (finding of the orchestration drill, 2026-11-07).
 */
export function healthReport(
  postgres: ProbeState,
  redis: ProbeState,
  worker: WorkerHealth = { alive: false, queues: {} },
): HealthReport {
  const status =
    postgres === 'up' && redis === 'up' && worker.alive ? 'ok' : 'degraded'
  return {
    status,
    postgres,
    redis,
    worker,
  }
}
