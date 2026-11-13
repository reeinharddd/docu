// El latido del worker, como pieza reutilizable (BRIEF #46).
//
// Publica en Redis quién vive y cómo están las colas. La API lo lee en
// `/health`. Si el worker muere, la clave expira y la salud lo dice.
import type { Redis } from 'ioredis'
import { publishHeartbeat, type QueueDepth } from './heartbeat.js'

export interface HeartbeatLoop {
  /** Publica ahora mismo (además del intervalo). */
  beat(): Promise<void>
  stop(): void
}

export function startHeartbeat(options: {
  redis: Redis
  depths: () => Promise<Record<string, QueueDepth>>
  intervalMs: number
  ttlMs: number
  onError?: (error: unknown) => void
}): HeartbeatLoop {
  let stopped = false

  const beat = async (): Promise<void> => {
    if (stopped) {
      return
    }
    try {
      await publishHeartbeat(
        options.redis,
        { at: new Date().toISOString(), queues: await options.depths() },
        options.ttlMs,
      )
    } catch (error) {
      options.onError?.(error)
    }
  }

  const timer = setInterval(() => void beat(), options.intervalMs)
  return {
    beat,
    stop() {
      stopped = true
      clearInterval(timer)
    },
  }
}
