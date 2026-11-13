import type { FamilyCode, RuleCode } from '../../../core/types/catalog'

/** POST /v1/files -> 201 (ARQUITECTURA.md §3.1). */
export interface UploadReceipt {
  sourceFileId: string
  sha256: string
}

/** What the validation decided about a file (CONTRATO.md §3). */
export type Decision = 'valid' | 'human_review' | 'quarantine'

export interface RuleResult {
  code: RuleCode
  passed: boolean
  message: string
}

/** GET /v1/files/:id/validation -> 200. */
export interface FileValidation {
  sourceFileId: string
  fileName: string
  sha256: string
  family: FamilyCode | null
  /** Who decided the family: the uploader, the parser or the AI (ADR-0006). */
  familySource: 'declared' | 'detected' | 'ai'
  decision: Decision
  rules: RuleResult[]
  /** One sentence for the person, in Spanish. */
  summary: string
  /** Identifier to open in Búsqueda ("Ver dato"). */
  searchKey: string | null
}
