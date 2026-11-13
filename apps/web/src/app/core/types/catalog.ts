/**
 * Case vocabulary shared by every screen: file families, validation rules
 * and plant labels. Slugs are approved case data (CASO.md, #9 fichas) and
 * never change; the Spanish labels and icons come from
 * docs/diseno/CATEGORIAS.md (icons live with the UI atoms). When the backend serves family_config and
 * validation_rule, the labels move there and this stays as the type.
 */
import type { Department } from './permissions'

export type FamilyCode =
  | 'programa_planeacion'
  | 'recepcion_rollo'
  | 'inventario'
  | 'excel_turno'
  | 'correo_hermana'
  | 'escaneado'

export const FAMILY_LABELS: Record<FamilyCode, string> = {
  programa_planeacion: 'Programa de planeación',
  recepcion_rollo: 'Recepción de rollo',
  inventario: 'Inventario',
  excel_turno: 'Excel de turno',
  correo_hermana: 'Correo de planta hermana',
  escaneado: 'Escaneo de calidad',
}

export const FAMILY_CODES = Object.keys(FAMILY_LABELS) as FamilyCode[]

export const UNCLASSIFIED_LABEL = 'Sin clasificar'

export type RuleCode =
  | 'R-P1'
  | 'R-P2'
  | 'R-P3'
  | 'R-P4'
  | 'R-Q1'
  | 'R-A1'
  | 'R-T1'

export type RuleSeverity = 'block' | 'warning'

export interface RuleInfo {
  severity: RuleSeverity
  short: string
  reason: string
}

export const RULES: Record<RuleCode, RuleInfo> = {
  'R-P1': {
    severity: 'block',
    short: 'Sin certificado',
    reason: 'El rollo no tiene certificado; no se puede programar.',
  },
  'R-P2': {
    severity: 'block',
    short: 'Medida distinta',
    reason: 'La medida recibida no coincide con la pedida.',
  },
  'R-P3': {
    severity: 'block',
    short: 'Material ausente',
    reason: 'El material no está en almacén; bloquea la fecha.',
  },
  'R-P4': {
    severity: 'warning',
    short: 'Cambio de la hermana',
    reason:
      'Un correo de la planta hermana cambia esta orden; el reporte anterior queda pausado.',
  },
  'R-Q1': {
    severity: 'block',
    short: 'Solo Calidad libera',
    reason: 'La liberación necesita confirmación de Calidad.',
  },
  'R-A1': {
    severity: 'block',
    short: 'Paro sin motivo',
    reason: 'Paro de más de 30 min sin motivo registrado.',
  },
  'R-T1': {
    severity: 'block',
    short: 'Stock mínimo',
    reason: 'El film o el Tyvek están por debajo del mínimo; bloquea la orden.',
  },
}

export const RULE_CODES = Object.keys(RULES) as RuleCode[]

export function isRuleCode(value: unknown): value is RuleCode {
  return typeof value === 'string' && value in RULES
}

/** Who confirmed an official value, and when (ADR-0006, RF-03). */
export interface Confirmation {
  by: string
  at: string
}

/** Where a value came from: the original file and its logical document. */
export interface SourceRef {
  fileName: string
  documentId: string
  family: FamilyCode
}

/** Department labels (CATEGORIAS.md §4.1). */
export const DEPARTMENT_LABELS: Record<Department, string> = {
  planeacion: 'Planeación',
  almacen: 'Almacén',
  calidad: 'Calidad',
  produccion: 'Producción',
  materiales: 'Materiales',
  mantenimiento: 'Mantenimiento',
  corporativo: 'Corporativo',
}
