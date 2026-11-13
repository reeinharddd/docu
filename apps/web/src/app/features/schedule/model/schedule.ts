import type {
  Confirmation,
  RuleCode,
  SourceRef,
} from '../../../core/types/catalog'

export type Shift = 'T1' | 'T2' | 'T3'

/** Roll assignability in the program (CATEGORIAS.md §2.1). */
export type RollState = 'assignable' | 'blocked' | 'committed' | 'replan'

export interface ScheduleEntry {
  id: string
  day: string
  shift: Shift
  machine: string
  orderId: string
  product: string
  materialId: string
  rollId: string | null
  plannedQty: number
  unit: string
  state: RollState
  /** Live blocks and warnings on this row (R-P1, R-P2, R-P3, R-P4, R-T1). */
  blocks: RuleCode[]
}

/**
 * GET /v1/official-records?type=production_schedule&week=YYYY-MM-DD.
 * The weekly program as official record: revision, who approved it and
 * where it came from (the Excel Frankenstein, sanitized).
 */
export interface WeekSchedule {
  week: string
  revision: number
  source: SourceRef
  confirmation: Confirmation | null
  syncedAt: string
  entries: ScheduleEntry[]
}

/** POST /v1/sources/:id/sync -> 202. */
export interface SyncAccepted {
  jobId: string
}
