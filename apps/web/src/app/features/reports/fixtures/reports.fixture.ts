/**
 * DEMO ONLY — the day report of the incident (G6, Monday 26-oct) and the
 * Friday report paused by the sister plant's mail (R-P4), synthetic, until
 * the endpoint of #39 lands.
 */
import type { DemoRoute } from '../../../core/middleware/api/demo-backend'
import type { DayReport, ReportItem } from '../model/reports'

const TURNO_TP01 = {
  fileName: 'turno-TP01-T1-2026-10-26.xlsx',
  documentId: 'D-13',
  family: 'excel_turno',
} as const

const MONDAY_ITEMS: ReportItem[] = [
  {
    id: 'm-good-tb01',
    group: 'production',
    label: 'Piezas buenas',
    machine: 'TB-01',
    value: 4820,
    unit: 'pzas',
    status: 'official',
    source: { ...TURNO_TP01, fileName: 'turno-TB01-T1-2026-10-26.xlsx' },
    ruleCode: null,
    searchKey: 'TB-01',
  },
  {
    id: 'm-good-tb02',
    group: 'production',
    label: 'Piezas buenas',
    machine: 'TB-02',
    value: 4610,
    unit: 'pzas',
    status: 'official',
    source: { ...TURNO_TP01, fileName: 'turno-TB02-T2-2026-10-26.xlsx' },
    ruleCode: null,
    searchKey: 'TB-02',
  },
  {
    id: 'm-good-tp01',
    group: 'production',
    label: 'Piezas buenas',
    machine: 'TP-01',
    value: 0,
    unit: 'pzas',
    status: 'official',
    source: TURNO_TP01,
    ruleCode: null,
    searchKey: 'TP-01',
  },
  {
    id: 'm-scrap-tp01',
    group: 'scrap',
    label: 'Merma',
    machine: 'TP-01',
    value: 36,
    unit: 'kg',
    status: 'official',
    source: TURNO_TP01,
    ruleCode: null,
    searchKey: 'TP-01',
  },
  {
    id: 'm-scrap-tb01',
    group: 'scrap',
    label: 'Merma',
    machine: 'TB-01',
    value: 4,
    unit: 'kg',
    status: 'official',
    source: { ...TURNO_TP01, fileName: 'turno-TB01-T1-2026-10-26.xlsx' },
    ruleCode: null,
    searchKey: 'TB-01',
  },
  {
    id: 'm-stop-tp01',
    group: 'downtime',
    label: 'Tiempo detenido',
    machine: 'TP-01',
    value: 180,
    unit: 'min',
    status: 'official',
    source: TURNO_TP01,
    ruleCode: null,
    searchKey: 'TP-01',
  },
  {
    id: 'm-stop-reason',
    group: 'downtime',
    label: 'Paros sin motivo',
    machine: 'TP-01',
    value: 1,
    unit: 'paro',
    status: 'pending',
    source: TURNO_TP01,
    ruleCode: 'R-A1',
    searchKey: 'TP-01',
  },
  {
    id: 'm-blocked-rolls',
    group: 'blocks',
    label: 'Rollos no asignables',
    machine: null,
    value: 2,
    unit: 'rollos',
    status: 'official',
    source: {
      fileName: 'recepcion-sab-24oct.xlsx',
      documentId: 'D-10',
      family: 'recepcion_rollo',
    },
    ruleCode: 'R-P1',
    searchKey: 'R-017',
  },
  {
    id: 'm-orders-risk',
    group: 'blocks',
    label: 'Órdenes en riesgo',
    machine: null,
    value: 3,
    unit: 'órdenes',
    status: 'official',
    source: {
      fileName: 'aviso-embarque-tyvek.eml',
      documentId: 'D-06',
      family: 'correo_hermana',
    },
    ruleCode: 'R-P4',
    searchKey: 'ORD-2026-0042',
  },
]

const FRIDAY_ITEMS: ReportItem[] = [
  {
    id: 'f-good-tp01',
    group: 'production',
    label: 'Piezas buenas',
    machine: 'TP-01',
    value: 11850,
    unit: 'pzas',
    status: 'official',
    source: { ...TURNO_TP01, fileName: 'turno-TP01-T1-2026-10-23.xlsx' },
    ruleCode: null,
    searchKey: 'TP-01',
  },
  {
    id: 'f-scrap-tp01',
    group: 'scrap',
    label: 'Merma',
    machine: 'TP-01',
    value: 6,
    unit: 'kg',
    status: 'official',
    source: { ...TURNO_TP01, fileName: 'turno-TP01-T1-2026-10-23.xlsx' },
    ruleCode: null,
    searchKey: 'TP-01',
  },
  {
    id: 'f-plan',
    group: 'blocks',
    label: 'Órdenes programadas para el lunes',
    machine: null,
    value: 10,
    unit: 'órdenes',
    status: 'official',
    source: {
      fileName: 'programa-semana44-rev3.xlsx',
      documentId: 'D-05',
      family: 'programa_planeacion',
    },
    ruleCode: null,
    searchKey: 'ORD-2026-0042',
  },
]

export const REPORTS_FIXTURE: Record<string, DayReport> = {
  '2026-10-26': {
    date: '2026-10-26',
    generatedAt: '2026-10-26T15:30:00-07:00',
    total: MONDAY_ITEMS.length,
    items: MONDAY_ITEMS,
    alerts: [
      {
        metric: 'Merma TP-01',
        value: 36,
        threshold: 20,
        unit: 'kg',
        message:
          'La merma de TP-01 pasó el umbral del turno: revisar material y montaje.',
        recipients: ['Jorge (Producción)', 'Andrés (Materiales)'],
      },
    ],
    paused: null,
  },
  '2026-10-23': {
    date: '2026-10-23',
    generatedAt: '2026-10-23T16:00:00-07:00',
    total: FRIDAY_ITEMS.length,
    items: FRIDAY_ITEMS,
    alerts: [],
    paused: {
      ruleCode: 'R-P4',
      reason:
        'El correo de la hermana de las 15:02 cambió lote y fecha del Tyvek; este reporte usaba el programa anterior.',
      since: '2026-10-23T15:02:00-07:00',
    },
  },
}

export const DEFAULT_REPORT_DATE = '2026-10-26'

export function reportsDemoRoutes(): DemoRoute[] {
  return [
    {
      method: 'GET',
      path: /^\/reports\/day$/,
      respond: ({ query }) => {
        const date = query.get('date') ?? DEFAULT_REPORT_DATE
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return {
            status: 422,
            body: {
              code: 'VALIDATION_ERROR',
              message: 'La fecha no es válida.',
            },
          }
        }
        const found = REPORTS_FIXTURE[date]
        const body: DayReport = found
          ? structuredClone(found)
          : {
              date,
              generatedAt: '',
              total: 0,
              items: [],
              alerts: [],
              paused: null,
            }
        return { body }
      },
    },
  ]
}
