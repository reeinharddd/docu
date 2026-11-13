// Bandeja de revisión humana — servicio (BRIEF #12).
//
// Es el módulo `inbox` de ARQUITECTURA.md §2: recibe la propuesta ya hecha y
// ejecuta las dos disposiciones posibles (confirmar o rechazar). El servicio
// posee las reglas; el puerto trae el desenlace de la base.
import { Inject, Injectable } from '@nestjs/common'
import type { SessionUser } from '../auth/auth.service.js'
import { ApiError } from '../common/api-error.js'
import type { Page } from '../common/pagination.js'
import {
  type DispositionInput,
  type DispositionOutcome,
  INBOX_STORE,
  type InboxProposalRow,
  type InboxStore,
} from './inbox.store.js'

export interface InboxProposalDto {
  id: string
  code: string
  status: string
  version: number
  data: unknown
  entityType: { code: string; name: string }
  source: { id: string; originalName: string } | null
  updatedAt: string
}

export interface ConfirmedDto {
  id: string
  status: string
  version: number
  confirmedAt: string
}

export interface RejectedDto {
  id: string
  status: string
  version: number
}

export interface DispositionContext {
  ipAddress?: string | undefined
  userAgent?: string | undefined
}

// El DTO es el contrato público: la fila lleva internales (facility_id) y la
// API nunca los filtra.
function toDto(row: InboxProposalRow): InboxProposalDto {
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    version: row.version,
    data: row.data,
    entityType: { code: row.entityTypeCode, name: row.entityTypeName },
    source:
      row.sourceFileId === null
        ? null
        : { id: row.sourceFileId, originalName: row.sourceOriginalName ?? '' },
    updatedAt: row.updatedAt.toISOString(),
  }
}

// Un `:id` de otra instalación es 404, no 403 (ARQUITECTURA.md §3.4):
// responder 403 confirmaría que el recurso existe en otro lado.
function assertDisposition(outcome: DispositionOutcome): void {
  if (outcome.outcome === 'not-found') {
    throw ApiError.notFound('La propuesta no existe en esta instalación.')
  }
  if (outcome.outcome === 'not-in-review') {
    throw ApiError.validation('La propuesta no está en revisión.')
  }
  if (outcome.outcome === 'already-disposed') {
    throw ApiError.conflict('La propuesta ya fue confirmada o rechazada.')
  }
  if (outcome.outcome === 'no-origin') {
    // `truth.origin_history.source_file_id` es NOT NULL: sin documento no hay
    // origen, y un dato oficial sin origen es justo lo que RF-03 prohíbe.
    throw ApiError.validation(
      'La propuesta no tiene documento de origen: no se puede confirmar.',
    )
  }
}

@Injectable()
export class InboxService {
  constructor(@Inject(INBOX_STORE) private readonly store: InboxStore) {}

  async list(
    facilityId: string,
    page: Page,
  ): Promise<{ rows: InboxProposalDto[]; total: number }> {
    const [rows, total] = await Promise.all([
      this.store.listPending({
        facilityId,
        limit: page.limit,
        offset: page.offset,
      }),
      this.store.countPending(facilityId),
    ])
    return { rows: rows.map(toDto), total }
  }

  /**
   * Confirmar deja el dato oficial: `official` con responsable y fecha, la
   * versión incrementada y una fila en `truth.origin_history` con el origen
   * (ARQUITECTURA.md §4.2).
   */
  async confirm(
    facilityId: string,
    entityId: string,
    user: SessionUser,
    context: DispositionContext = {},
  ): Promise<ConfirmedDto> {
    const outcome = await this.store.confirm({
      ...this.input(facilityId, entityId, user),
      ...context,
    })
    assertDisposition(outcome)
    if (outcome.outcome !== 'confirmed') {
      throw ApiError.internal()
    }
    return {
      id: outcome.id,
      status: outcome.status,
      version: outcome.version,
      confirmedAt: outcome.confirmedAt.toISOString(),
    }
  }

  /** Rechazar deja `rejected` y solo la bitácora: un dato rechazado no tiene origen oficial. */
  async reject(
    facilityId: string,
    entityId: string,
    user: SessionUser,
    context: DispositionContext = {},
  ): Promise<RejectedDto> {
    const outcome = await this.store.reject({
      ...this.input(facilityId, entityId, user),
      ...context,
    })
    assertDisposition(outcome)
    if (outcome.outcome !== 'rejected') {
      throw ApiError.internal()
    }
    return { id: outcome.id, status: outcome.status, version: outcome.version }
  }

  private input(
    facilityId: string,
    entityId: string,
    user: SessionUser,
  ): DispositionInput {
    return { facilityId, entityId, actorId: user.userId }
  }
}
