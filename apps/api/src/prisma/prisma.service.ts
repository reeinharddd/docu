// PrismaService — the single database client of the API (ADR-0004).
//
// Prisma 7 with the pg driver adapter: the connection string comes from the
// environment (never from the schema). Fails at boot if DATABASE_URL is
// missing or unreachable: a backend without its database is a broken boot.
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL no está definida (.env o entorno): la API no arranca sin base',
      )
    }
    super({ adapter: new PrismaPg({ connectionString }) })
  }

  async onModuleInit(): Promise<void> {
    await this.$connect()
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
  }
}
