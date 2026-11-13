// El latido del worker (BRIEF #46).
//
// BullMQ no tiene un "está vivo" propio: el worker publica su estado en
// Redis con un TTL y la API lo lee. Si el worker muere, la clave expira y la
// salud lo dice, en vez de fingir que todo está bien.
import type { Redis } from 'ioredis'

export const WORKER_HEARTBEAT_KEY = 'docu:worker:heartbeat'

export interface QueueDepth {
  waiting: number
  active: number
  delayed: number
  failed: number
  completed: number
  paused: number
}

export interface WorkerHeartbeat {
  /** Momento del latido. */
  at: string
  /** Profundidad de cada cola en ese momento. */
  queues: Record<string, QueueDepth>
}

export async function publishHeartbeat(
  redis: Redis,
  payload: WorkerHeartbeat,
  ttlMs: number,
): Promise<void> {
  await redis.set(WORKER_HEARTBEAT_KEY, JSON.stringify(payload), 'PX', ttlMs)
}

export async function readHeartbeat(
  redis: Redis,
): Promise<WorkerHeartbeat | null> {
  const raw = await redis.get(WORKER_HEARTBEAT_KEY)
  if (raw === null) {
    return null
  }
  try {
    return JSON.parse(raw) as WorkerHeartbeat
  } catch {
    // Un latido corrupto es un worker que no se puede leer: se trata como
    // worker caído, que es lo que es.
    return null
  }
}
