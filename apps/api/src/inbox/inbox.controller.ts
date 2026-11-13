// GET /v1/inbox, POST /v1/inbox/:id/confirm y /reject — bandeja de revisión
// humana (ARQUITECTURA.md §3.1). Controlador delgado: autentica, exige el
// permiso, pagina y delega; las reglas de disposición viven en el servicio.
import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
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
  type ConfirmedDto,
  type InboxProposalDto,
  InboxService,
  type RejectedDto,
} from './inbox.service.js'

@Controller('v1/inbox')
@UseGuards(SessionGuard, PermissionsGuard)
export class InboxController {
  constructor(private readonly inbox: InboxService) {}

  @Get()
  @RequirePermission('read')
  async list(
    @Req() request: SessionRequest,
    @Query() query: Record<string, unknown>,
    @Res({ passthrough: true }) response: Response,
  ): Promise<InboxProposalDto[]> {
    const user = sessionUserOf(request)
    const page = parsePagination(query)
    const { rows, total } = await this.inbox.list(user.facilityId, page)
    response.setHeader('X-Total-Count', String(total))
    return rows
  }

  @Post(':id/confirm')
  @HttpCode(200)
  @RequirePermission('confirm')
  async confirm(
    @Req() request: SessionRequest,
    @Param('id') id: string,
  ): Promise<ConfirmedDto> {
    const user = sessionUserOf(request)
    return this.inbox.confirm(user.facilityId, id, user, {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    })
  }

  @Post(':id/reject')
  @HttpCode(200)
  @RequirePermission('confirm')
  async reject(
    @Req() request: SessionRequest,
    @Param('id') id: string,
  ): Promise<RejectedDto> {
    const user = sessionUserOf(request)
    return this.inbox.reject(user.facilityId, id, user, {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    })
  }
}
