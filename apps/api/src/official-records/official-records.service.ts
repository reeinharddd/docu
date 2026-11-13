// Dato oficial — servicio (BRIEF #12).
//
// Módulo `official-records` de ARQUITECTURA.md §2: solo lee. El dato oficial
// es el que alguien confirmó; por eso la fuente es la vista
// `truth.official_record` y no una consulta propia.
import { Inject, Injectable } from '@nestjs/common'
import type { Page } from '../common/pagination.js'
import {
  OFFICIAL_RECORDS_STORE,
  type OfficialRecordRow,
  type OfficialRecordsStore,
} from './official-records.store.js'

export interface OfficialRecordDto {
  id: string
  code: string
  entityType: { code: string; name: string }
  data: unknown
  version: number
  confirmedBy: { username: string; fullName: string } | null
  confirmedAt: string | null
  sourceFileId: string | null
  updatedAt: string
}

function toDto(row: OfficialRecordRow): OfficialRecordDto {
  return {
    id: row.id,
    code: row.code,
    entityType: { code: row.entityTypeCode, name: row.entityTypeName },
    data: row.data,
    version: row.version,
    confirmedBy:
      row.confirmedByUsername === null
        ? null
        : {
            username: row.confirmedByUsername,
            fullName: row.confirmedByName ?? '',
          },
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    sourceFileId: row.sourceFileId,
    updatedAt: row.updatedAt.toISOString(),
  }
}

@Injectable()
export class OfficialRecordsService {
  constructor(
    @Inject(OFFICIAL_RECORDS_STORE)
    private readonly store: OfficialRecordsStore,
  ) {}

  async list(
    facilityId: string,
    page: Page,
  ): Promise<{ rows: OfficialRecordDto[]; total: number }> {
    const [rows, total] = await Promise.all([
      this.store.listOfficial({
        facilityId,
        limit: page.limit,
        offset: page.offset,
      }),
      this.store.countOfficial(facilityId),
    ])
    return { rows: rows.map(toDto), total }
  }
}
