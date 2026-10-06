import { Controller, Get } from '@nestjs/common'
import { Redis } from 'ioredis'
// NestJS resuelve la inyeccion por constructor con emitDecoratorMetadata, que
// necesita la clase en runtime. Un `import type` se borra al compilar, la
// dependencia llega como Object y la API no arranca. Regla general: en
// apps/api, ningun provider inyectado por constructor se importa con `import type`.
// biome-ignore lint/style/useImportType: NestJS necesita la clase en runtime
import { PrismaService } from '../prisma.service.js'

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
