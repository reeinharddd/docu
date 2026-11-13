import type {
  Confirmation,
  RuleCode,
  SourceRef,
} from '../../../core/types/catalog'
import type { Department } from '../../../core/types/permissions'

export type RecordStatus = 'official' | 'pending' | 'quarantine'

/**
 * GET /v1/official-records?q=&area=&from= -> 200 array. A value with its
 * citation: file, rule, calculation and who confirmed (RF-04, RNF-02).
 */
export interface OfficialRecord {
  id: string
  label: string
  value: string
  unit: string | null
  status: RecordStatus
  area: Department
  date: string
  source: SourceRef
  ruleCode: RuleCode | null
  calculation: string
  confirmation: Confirmation | null
  /** Identifiers this record answers to (roll, order, machine, material). */
  keys: string[]
}

export type LineageNodeType =
  | 'sister_change'
  | 'goods_receipt'
  | 'roll'
  | 'production_order'
  | 'machine'
  | 'shift'
  | 'document'

export interface LineageNode {
  type: LineageNodeType
  /** Spanish label of the step ("Rollo", "Órdenes"). */
  label: string
  items: Array<{ id: string; detail: string; status: RecordStatus | null }>
}

export interface OriginEvent {
  at: string
  action: string
  by: string
  fileName: string
  ruleCode: RuleCode | null
}

/** GET /v1/lineage/:id -> entity, history and relations (ARQUITECTURA §3.1). */
export interface Lineage {
  id: string
  chain: LineageNode[]
  history: OriginEvent[]
}
