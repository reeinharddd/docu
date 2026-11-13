import type {
  Confirmation,
  RuleCode,
  SourceRef,
} from '../../../core/types/catalog'
import type { Permission } from '../../../core/types/permissions'

/**
 * What the review inbox shows. Two reads, as in ARQUITECTURA.md §3.1:
 * GET /v1/quarantine (stopped, with reason and rule) and GET /v1/inbox
 * (proposals waiting for a human). Both share this shape.
 */
export type InboxStatus = 'quarantine' | 'pending' | 'official' | 'rejected'

export interface InboxItem {
  id: string
  /** What the value is about: "Rollo R-017", "Turno TP-01 · T1". */
  subject: string
  /** The field and its extracted value. */
  field: string
  value: string
  status: InboxStatus
  /** Rule that stopped it or that governs its confirmation (R-Q1). */
  ruleCode: RuleCode | null
  /** Human reason, always visible next to the status (RF-02). */
  reason: string
  source: SourceRef
  uploadedBy: string
  receivedAt: string
  /** Permission needed to confirm; null = anyone who can review. */
  requiredPermission: Permission | null
  confirmation: Confirmation | null
  /** Identifier to open in Búsqueda ("Ver origen"). */
  searchKey: string
}

/** POST /v1/inbox/:id/confirm and /reject response. */
export interface Disposition {
  id: string
  status: InboxStatus
  version: number
  confirmedAt?: string
}
