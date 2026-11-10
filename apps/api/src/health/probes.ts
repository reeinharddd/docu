import { Redis } from 'ioredis'
import { Client } from 'pg'

export type ProbeState = 'up' | 'down'

export type HealthReport = {
  status: 'ok' | 'degraded'
  postgres: ProbeState
  redis: ProbeState
}

/**
 * Each probe answers with its own state and never throws: the health gate
 * must report which segment failed, not fail with an opaque error.
 */
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
 * All up -> ok. Any segment down -> degraded. The gate decides the status
 * code from this report, so the rule lives in one testable place.
 */
export function healthReport(
  postgres: ProbeState,
  redis: ProbeState,
): HealthReport {
  return {
    status: postgres === 'up' && redis === 'up' ? 'ok' : 'degraded',
    postgres,
    redis,
  }
}
