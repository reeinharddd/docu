// GET /v1/official-records — dato confirmado, con su fuente y su responsable
// (ARQUITECTURA.md §3.1). El módulo solo lee: no escribe ni propone.
import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import {
  PermissionsGuard,
  RequirePermission,
} from '../auth/permissions.guard.js'
import {
  SessionGuard,
  type SessionRequest,
  sessionUserOf,
} from '../auth/session.guard.js'
import { parsePagination } from '../common/pagination.js'
import {
  type OfficialRecordDto,
  OfficialRecordsService,
} from './official-records.service.js'

@Controller('v1/official-records')
@UseGuards(SessionGuard, PermissionsGuard)
export class OfficialRecordsController {
  constructor(private readonly records: OfficialRecordsService) {}

  @Get()
  @RequirePermission('read')
  async list(
    @Req() request: SessionRequest,
    @Query() query: Record<string, unknown>,
    @Res({ passthrough: true }) response: Response,
  ): Promise<OfficialRecordDto[]> {
    const user = sessionUserOf(request)
    const page = parsePagination(query)
    const { rows, total } = await this.records.list(user.facilityId, page)
    response.setHeader('X-Total-Count', String(total))
    return rows
  }
}
