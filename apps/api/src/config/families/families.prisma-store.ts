// Prisma adapter for the families port.
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service.js'
import type { FamiliesStore, FamilyRow } from './families.store.js'

@Injectable()
export class PrismaFamiliesStore implements FamiliesStore {
  constructor(private readonly prisma: PrismaService) {}

  async list(input: {
    facilityId: string
    limit: number
    offset: number
  }): Promise<FamilyRow[]> {
    const rows = await this.prisma.familyConfig.findMany({
      where: { facilityId: input.facilityId },
      orderBy: [{ familyCode: 'asc' }, { id: 'asc' }],
      skip: input.offset,
      take: input.limit,
    })
    return rows.map((row) => ({
      id: row.id,
      facilityId: row.facilityId,
      familyCode: row.familyCode,
      name: row.name,
      parserKey: row.parserKey,
      isOcrRequired: row.isOcrRequired,
    }))
  }

  async count(facilityId: string): Promise<number> {
    return this.prisma.familyConfig.count({ where: { facilityId } })
  }

  async findByCode(
    facilityId: string,
    familyCode: string,
  ): Promise<FamilyRow | null> {
    const row = await this.prisma.familyConfig.findFirst({
      where: { facilityId, familyCode },
    })
    if (!row) {
      return null
    }
    return {
      id: row.id,
      facilityId: row.facilityId,
      familyCode: row.familyCode,
      name: row.name,
      parserKey: row.parserKey,
      isOcrRequired: row.isOcrRequired,
    }
  }
}
