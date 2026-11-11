// Reference slice — READ-ONLY catalog of document families.
//
// This module is the pattern to copy for every endpoint: thin controller,
// service that owns the rules, §2.1 errors, ADR-0022 pagination with
// X-Total-Count, stable order with an id tiebreak, and facility scoping
// from the session (never from the query string).
import { Inject, Injectable } from '@nestjs/common'
import { ApiError } from '../../common/api-error.js'
import type { Page } from '../../common/pagination.js'
import {
  FAMILIES_STORE,
  type FamiliesStore,
  type FamilyRow,
} from './families.store.js'

export interface FamilyDto {
  id: string
  familyCode: string
  name: string
  parserKey: string
  isOcrRequired: boolean
}

// The DTO is the public contract: the row carries internals (facility_id) and
// the API never leaks them.
function toDto(row: FamilyRow): FamilyDto {
  return {
    id: row.id,
    familyCode: row.familyCode,
    name: row.name,
    parserKey: row.parserKey,
    isOcrRequired: row.isOcrRequired,
  }
}

@Injectable()
export class FamiliesService {
  constructor(@Inject(FAMILIES_STORE) private readonly store: FamiliesStore) {}

  async list(
    facilityId: string,
    page: Page,
  ): Promise<{ rows: FamilyDto[]; total: number }> {
    const [rows, total] = await Promise.all([
      this.store.list({ facilityId, limit: page.limit, offset: page.offset }),
      this.store.count(facilityId),
    ])
    return { rows: rows.map(toDto), total }
  }

  async getByCode(facilityId: string, familyCode: string): Promise<FamilyDto> {
    const row = await this.store.findByCode(facilityId, familyCode)
    if (!row) {
      throw ApiError.notFound('La familia no existe en esta instalación.')
    }
    return toDto(row)
  }
}
