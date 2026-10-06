import { Controller, Get } from '@nestjs/common'
import { Redis } from 'ioredis'
import type { PrismaService } from '../prisma.service.js'

@Controller('health')
export class HealthController {
  constructor(private readonly db: PrismaService) {}

  @Get()
  async check() {
    await this.db.$queryRaw`SELECT 1`
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
