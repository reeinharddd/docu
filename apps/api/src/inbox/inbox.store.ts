// Bandeja de revisión — puerto de `inbox` (BRIEF #12).
//
// El servicio no sabe Prisma: conoce las reglas de disposición. El adaptador
// (`prisma-inbox.store.ts`) es el único que ve la base y el único que puede
// escribir las tres filas de una disposición en una transacción.
export const INBOX_STORE = 'INBOX_STORE'

/** Una propuesta en revisión (`graph.entity` en `pending_confirmation`). */
export interface InboxProposalRow {
  id: string
  code: string
  status: string
  version: number
  data: unknown
  entityTypeCode: string
  entityTypeName: string
  sourceFileId: string | null
  sourceOriginalName: string | null
  updatedAt: Date
}

/**
 * Resultado de una disposición. El servicio traduce cada desenlace al error
 * del contrato (§2.1): `not-found` → 404, `not-in-review` → 422,
 * `already-disposed` → 409, `no-origin` → 422.
 */
export type DispositionOutcome =
  | {
      outcome: 'confirmed'
      id: string
      status: string
      version: number
      confirmedAt: Date
    }
  | { outcome: 'rejected'; id: string; status: string; version: number }
  | { outcome: 'not-found' }
  | { outcome: 'not-in-review' }
  | { outcome: 'already-disposed' }
  | { outcome: 'no-origin' }

export interface DispositionInput {
  facilityId: string
  entityId: string
  actorId: string
  ipAddress?: string | undefined
  userAgent?: string | undefined
}

export interface InboxStore {
  listPending(input: {
    facilityId: string
    limit: number
    offset: number
  }): Promise<InboxProposalRow[]>
  countPending(facilityId: string): Promise<number>
  /** Confirma: `official` + `origin_history` + `audit_log`, en una transacción. */
  confirm(input: DispositionInput): Promise<DispositionOutcome>
  /** Rechaza: `rejected` + `audit_log`. Un dato rechazado no tiene origen. */
  reject(input: DispositionInput): Promise<DispositionOutcome>
}
