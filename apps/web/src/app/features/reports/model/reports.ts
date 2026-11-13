import type { RuleCode, SourceRef } from '../../../core/types/catalog'

export type ReportGroup = 'production' | 'scrap' | 'downtime' | 'blocks'

export interface ReportItem {
  id: string
  group: ReportGroup
  label: string
  machine: string | null
  value: number
  unit: string
  status: 'official' | 'pending'
  /** Every number cites its origin (RF-04): file, document and rule. */
  source: SourceRef
  ruleCode: RuleCode | null
  /** What to open in Búsqueda for "Ver origen". */
  searchKey: string
}

/** RF-05: one metric, one threshold, its recipients and its message. */
export interface ReportAlert {
  metric: string
  value: number
  threshold: number
  unit: string
  message: string
  recipients: string[]
}

/**
 * GET /v1/reports/day?date=YYYY-MM-DD -> { date, total, items }
 * (ARQUITECTURA.md §3.1), plus the alert (#39) and the R-P4 pause.
 */
export interface DayReport {
  date: string
  generatedAt: string
  total: number
  items: ReportItem[]
  alerts: ReportAlert[]
  paused: { ruleCode: RuleCode; reason: string; since: string } | null
}
