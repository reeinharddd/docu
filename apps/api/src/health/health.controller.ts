import { Controller, Get } from '@nestjs/common'
import { Redis } from 'ioredis'
import { Client } from 'pg'

@Controller('health')
export class HealthController {
  @Get()
  async check() {
    const connectionString = process.env.DATABASE_URL
    const db = new Client(connectionString ? { connectionString } : {})
    await db.connect()
    await db.query('SELECT 1')
    await db.end()

    const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    })
    const pong = await redis.ping()
    await redis.quit()

    return {
      status: 'ok',
      postgres: 'up',
      redis: pong === 'PONG' ? 'up' : 'down',
    }
  }
}
