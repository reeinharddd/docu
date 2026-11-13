// Adaptador Prisma del dato oficial (BRIEF #12).
//
// El dato oficial vive en la vista `truth.official_record`: no es una tabla
// y Prisma no la mapea, así que se consulta por SQL. La vista ya filtra por
// `status = 'official'`, que es la definición de dato oficial.
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import type {
  OfficialRecordRow,
  OfficialRecordsStore,
} from './official-records.store.js'

interface RawOfficialRecord {
  id: string
  entityTypeCode: string
  entityTypeName: string
  code: string
  data: unknown
  version: bigint
  confirmedByUsername: string | null
  confirmedByName: string | null
  confirmedAt: Date | null
  sourceFileId: string | null
  updatedAt: Date
}

@Injectable()
export class PrismaOfficialRecordsStore implements OfficialRecordsStore {
  constructor(private readonly prisma: PrismaService) {}

  async listOfficial(input: {
    facilityId: string
    limit: number
    offset: number
  }): Promise<OfficialRecordRow[]> {
    const rows = await this.prisma.$queryRaw<RawOfficialRecord[]>`
      SELECT
        "id",
        "entity_type_code" AS "entityTypeCode",
        "entity_type_name" AS "entityTypeName",
        "code",
        "data",
        "version",
        "confirmed_by_username" AS "confirmedByUsername",
        "confirmed_by_name" AS "confirmedByName",
        "confirmed_at" AS "confirmedAt",
        "source_file_id" AS "sourceFileId",
        "updated_at" AS "updatedAt"
      FROM "truth"."official_record"
      WHERE "facility_id" = ${input.facilityId}
      ORDER BY "confirmed_at" DESC NULLS LAST, "id" DESC
      LIMIT ${input.limit} OFFSET ${input.offset}
    `
    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      entityTypeCode: row.entityTypeCode,
      entityTypeName: row.entityTypeName,
      data: row.data,
      version: Number(row.version),
      confirmedByUsername: row.confirmedByUsername,
      confirmedByName: row.confirmedByName,
      confirmedAt: row.confirmedAt,
      sourceFileId: row.sourceFileId,
      updatedAt: row.updatedAt,
    }))
  }

  async countOfficial(facilityId: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<{ total: number }[]>`
      SELECT count(*)::int AS "total"
      FROM "truth"."official_record"
      WHERE "facility_id" = ${facilityId}
    `
    return rows[0]?.total ?? 0
  }
}
