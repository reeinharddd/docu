// GET /v1/families — paginated catalog of the installation's families.
// Plain array body + X-Total-Count header (ADR-0022). Stable order lives in
// the service. Scoped to the session's facility, never to a query param.
import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import type { Response } from 'express'
import {
  SessionGuard,
  type SessionRequest,
  sessionUserOf,
} from '../../auth/session.guard.js'
import { parsePagination } from '../../common/pagination.js'
import { FamiliesService, type FamilyDto } from './families.service.js'

@Controller('v1/families')
@UseGuards(SessionGuard)
export class FamiliesController {
  constructor(private readonly families: FamiliesService) {}

  @Get()
  async list(
    @Req() request: SessionRequest,
    @Query() query: Record<string, unknown>,
    @Res({ passthrough: true }) response: Response,
  ): Promise<FamilyDto[]> {
    const user = sessionUserOf(request)
    const page = parsePagination(query)
    const { rows, total } = await this.families.list(user.facilityId, page)
    response.setHeader('X-Total-Count', String(total))
    return rows
  }

  @Get(':familyCode')
  async getByCode(
    @Req() request: SessionRequest,
    @Param('familyCode') familyCode: string,
  ): Promise<FamilyDto> {
    const user = sessionUserOf(request)
    return this.families.getByCode(user.facilityId, familyCode)
  }
}
