// Conexión a Redis para BullMQ.
//
// BullMQ exige `maxRetriesPerRequest: null` en las conexiones del worker:
// con el límite por defecto, BullMQ corta la conexión cuando un job tarda y
// el trabajo se queda colgado en vez de reintentarse (script/queue-ping.ts ya
// lo hacía así).
import { Redis } from 'ioredis'

export function redisUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  return env.REDIS_URL ?? 'redis://localhost:6379'
}

export function createRedisConnection(url: string = redisUrl()): Redis {
  return new Redis(url, { maxRetriesPerRequest: null })
}

/**
 * Conexión para sondas: falla rápido. La de BullMQ reintenta sin parar, y una
 * sonda que reintenta para siempre dejaría la puerta de salud colgada cuando
 * Redis no responde.
 */
export function createProbeConnection(url: string = redisUrl()): Redis {
  return new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 })
}
