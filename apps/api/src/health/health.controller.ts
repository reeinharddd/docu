import { Controller, Get, HttpException } from '@nestjs/common'
import { Redis } from 'ioredis'
import { Client } from 'pg'

type ProbeState = 'up' | 'down'

/**
 * Operational gate (ARQUITECTURA.md §1): reports each segment honestly.
 * All up -> 200 { status: 'ok' }. Any segment down -> 503 with a structured
 * degraded body: a health gate that answers 500 without diagnosis hides
 * which segment failed, and one that answers 200 while a segment is down
 * lies (finding of the orchestration drill, 2026-11-07).
 */
@Controller('health')
export class HealthController {
  @Get()
  async check() {
    const postgres = await probePostgres()
    const redis = await probeRedis()
    const body = {
      status: postgres === 'up' && redis === 'up' ? 'ok' : 'degraded',
      postgres,
      redis,
    }
    if (body.status === 'degraded') throw new HttpException(body, 503)
    return body
  }
}

async function probePostgres(): Promise<ProbeState> {
  const connectionString = process.env.DATABASE_URL
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

async function probeRedis(): Promise<ProbeState> {
  const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
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
