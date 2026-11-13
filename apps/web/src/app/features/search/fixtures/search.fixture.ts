/**
 * DEMO ONLY — official records and lineage of the ghost roll (G5, G6),
 * synthetic, until the corpus of #61 and the API of #12 land.
 */
import type { DemoRoute } from '../../../core/middleware/api/demo-backend'
import type { Lineage, OfficialRecord } from '../model/search'

const RECEPCION = {
  fileName: 'recepcion-sab-24oct.xlsx',
  documentId: 'D-10',
  family: 'recepcion_rollo',
} as const
const TURNO = {
  fileName: 'turno-TP01-T1-2026-10-26.xlsx',
  documentId: 'D-13',
  family: 'excel_turno',
} as const
const CORREO = {
  fileName: 'aviso-embarque-tyvek.eml',
  documentId: 'D-06',
  family: 'correo_hermana',
} as const

export const RECORDS_FIXTURE: OfficialRecord[] = [
  {
    id: 'rec-roll-017',
    label: 'Rollo R-017 · asignabilidad',
    value: 'No asignable',
    unit: null,
    status: 'quarantine',
    area: 'almacen',
    date: '2026-10-24T09:40:00-07:00',
    source: RECEPCION,
    ruleCode: 'R-P1',
    calculation:
      'certificado_presente = falso en la recepción del sábado → R-P1 bloquea.',
    confirmation: null,
    keys: [
      'R-017',
      'ORD-2026-0042',
      'ORD-2026-0043',
      'ORD-2026-0048',
      'TP-01',
      'MAT-TYV-01',
    ],
  },
  {
    id: 'rec-roll-019',
    label: 'Rollo R-019 · medida de ancho',
    value: '248',
    unit: 'mm',
    status: 'quarantine',
    area: 'almacen',
    date: '2026-10-24T09:41:00-07:00',
    source: { ...RECEPCION, documentId: 'D-09' },
    ruleCode: 'R-P2',
    calculation:
      'Etiqueta: 248 mm · orden ORD-2026-0047 pide 250 mm → R-P2 bloquea.',
    confirmation: null,
    keys: ['R-019', 'ORD-2026-0047', 'TP-02', 'MAT-TYV-01'],
  },
  {
    id: 'rec-scrap-tp01',
    label: 'Merma TP-01 · T1 · 26-oct',
    value: '36',
    unit: 'kg',
    status: 'official',
    area: 'produccion',
    date: '2026-10-26T14:05:00-07:00',
    source: TURNO,
    ruleCode: null,
    calculation:
      '2 kg de film corrido (~120 m) + 34 kg de la purga del rollo montado.',
    confirmation: { by: 'Jorge (Producción)', at: '2026-10-26T15:10:00-07:00' },
    keys: ['TP-01', 'R-017', 'ORD-2026-0042'],
  },
  {
    id: 'rec-stop-tp01',
    label: 'Tiempo detenido TP-01 · T1 · 26-oct',
    value: '180',
    unit: 'min',
    status: 'official',
    area: 'produccion',
    date: '2026-10-26T14:05:00-07:00',
    source: TURNO,
    ruleCode: null,
    calculation:
      '45 min de paro (revisión y re-tensado) + 135 min de espera de material.',
    confirmation: { by: 'Jorge (Producción)', at: '2026-10-26T15:10:00-07:00' },
    keys: ['TP-01', 'R-017'],
  },
  {
    id: 'rec-downtime-reason',
    label: 'Paro TP-01 · T1 · motivo',
    value: 'Sin motivo',
    unit: null,
    status: 'quarantine',
    area: 'produccion',
    date: '2026-10-26T14:05:00-07:00',
    source: TURNO,
    ruleCode: 'R-A1',
    calculation: 'paro_min = 45 > 30 y paro_motivo vacío → R-A1 bloquea.',
    confirmation: null,
    keys: ['TP-01'],
  },
  {
    id: 'rec-good-tb01',
    label: 'Buenas TB-01 · T1 · 26-oct',
    value: '4820',
    unit: 'pzas',
    status: 'official',
    area: 'produccion',
    date: '2026-10-26T14:00:00-07:00',
    source: { ...TURNO, fileName: 'turno-TB01-T1-2026-10-26.xlsx' },
    ruleCode: null,
    calculation: 'cantidad_buena del Excel de turno de TB-01.',
    confirmation: { by: 'Jorge (Producción)', at: '2026-10-26T15:05:00-07:00' },
    keys: ['TB-01', 'ORD-2026-0039'],
  },
  {
    id: 'rec-stock-tyv',
    label: 'Stock Tyvek MAT-TYV-01',
    value: '3',
    unit: 'rollos',
    status: 'pending',
    area: 'almacen',
    date: '2026-10-26T07:10:00-07:00',
    source: {
      fileName: 'conteo-almacen-26oct.xlsx',
      documentId: 'D-11',
      family: 'inventario',
    },
    ruleCode: null,
    calculation:
      'Conteo físico 07:10 = 3 rollos; SAP del viernes decía 5. Espera confirmación.',
    confirmation: null,
    keys: ['MAT-TYV-01', 'R-017', 'R-019', 'R-021'],
  },
  {
    id: 'rec-qa-l2610-07',
    label: 'Liberación QA · lote L-2610-07 (R-021)',
    value: 'Pendiente',
    unit: null,
    status: 'pending',
    area: 'calidad',
    date: '2026-10-26T07:20:00-07:00',
    source: {
      fileName: 'peel-test-L2610-07.pdf',
      documentId: 'D-15',
      family: 'escaneado',
    },
    ruleCode: 'R-Q1',
    calculation: 'Peel test aprobado y firmado; solo Calidad puede liberarlo.',
    confirmation: null,
    keys: ['R-021', 'L-2610-07', 'MAT-TYV-01'],
  },
  {
    id: 'rec-sister-change',
    label: 'Aviso de la hermana · embarque de Tyvek',
    value: 'Lote distinto y retraso',
    unit: null,
    status: 'official',
    area: 'planeacion',
    date: '2026-10-23T15:02:00-07:00',
    source: CORREO,
    ruleCode: 'R-P4',
    calculation:
      'tipo = lote; nombra R-017 → órdenes ORD-2026-0042, 0043 y 0048 a replan.',
    confirmation: { by: 'Ana (Planeación)', at: '2026-10-26T06:10:00-07:00' },
    keys: [
      'R-017',
      'ORD-2026-0042',
      'ORD-2026-0043',
      'ORD-2026-0048',
      'MAT-TYV-01',
    ],
  },
]

const R017_CHAIN: Lineage['chain'] = [
  {
    type: 'sister_change',
    label: 'Correo de la hermana',
    items: [
      {
        id: 'D-06',
        detail: 'Vie 23-oct 15:02 · lote distinto y retraso',
        status: 'official',
      },
    ],
  },
  {
    type: 'goods_receipt',
    label: 'Recepción',
    items: [
      {
        id: 'D-10',
        detail: 'Sáb 24-oct · 4 de 6 rollos · certificado pendiente',
        status: 'quarantine',
      },
    ],
  },
  {
    type: 'roll',
    label: 'Rollo',
    items: [
      {
        id: 'R-017',
        detail: 'Tyvek MAT-TYV-01 · no asignable (R-P1)',
        status: 'quarantine',
      },
    ],
  },
  {
    type: 'production_order',
    label: 'Órdenes en riesgo',
    items: [
      { id: 'ORD-2026-0042', detail: 'Lun 26 · T1', status: 'quarantine' },
      { id: 'ORD-2026-0043', detail: 'Lun 26 · T2', status: 'quarantine' },
      { id: 'ORD-2026-0048', detail: 'Mar 27 · T1', status: 'pending' },
    ],
  },
  {
    type: 'machine',
    label: 'Máquina',
    items: [
      { id: 'TP-01', detail: 'Pouches · detenida ~3 h el lunes', status: null },
    ],
  },
  {
    type: 'shift',
    label: 'Turno',
    items: [
      {
        id: 'T1 · 26-oct',
        detail: 'Carmen · 36 kg de merma',
        status: 'official',
      },
    ],
  },
  {
    type: 'document',
    label: 'Documentos',
    items: [
      {
        id: 'D-13',
        detail: 'turno-TP01-T1-2026-10-26.xlsx',
        status: 'official',
      },
      { id: 'D-05', detail: 'programa-semana44-rev3.xlsx', status: 'official' },
    ],
  },
]

const R017_HISTORY: Lineage['history'] = [
  {
    at: '2026-10-23T15:02:00-07:00',
    action: 'Entra el correo de la hermana; R-P4 marca replan',
    by: 'Ana (Planeación)',
    fileName: 'aviso-embarque-tyvek.eml',
    ruleCode: 'R-P4',
  },
  {
    at: '2026-10-24T09:40:00-07:00',
    action: 'Recepción registrada; R-P1 detiene el rollo',
    by: 'Luis (Almacén)',
    fileName: 'recepcion-sab-24oct.xlsx',
    ruleCode: 'R-P1',
  },
  {
    at: '2026-10-26T06:10:00-07:00',
    action: 'Ana revisa el programa y confirma el aviso',
    by: 'Ana (Planeación)',
    fileName: 'programa-semana44-rev3.xlsx',
    ruleCode: null,
  },
  {
    at: '2026-10-26T14:05:00-07:00',
    action: 'Excel de turno: 36 kg de merma y 45 min de paro',
    by: 'Carmen (Producción)',
    fileName: 'turno-TP01-T1-2026-10-26.xlsx',
    ruleCode: 'R-A1',
  },
]

/** A lineage built from the record alone, for records without a fixture chain. */
function lineageFor(record: OfficialRecord): Lineage {
  if (record.keys.includes('R-017') && record.id !== 'rec-stock-tyv') {
    return { id: record.id, chain: R017_CHAIN, history: R017_HISTORY }
  }
  const history: Lineage['history'] = [
    {
      at: record.date,
      action: 'Archivo recibido y validado',
      by: 'DOCU',
      fileName: record.source.fileName,
      ruleCode: record.ruleCode,
    },
  ]
  if (record.confirmation) {
    history.push({
      at: record.confirmation.at,
      action: 'Dato confirmado como oficial',
      by: record.confirmation.by,
      fileName: record.source.fileName,
      ruleCode: null,
    })
  }
  return {
    id: record.id,
    chain: [
      {
        type: 'document',
        label: 'Documento',
        items: [
          {
            id: record.source.documentId,
            detail: record.source.fileName,
            status: record.status,
          },
        ],
      },
      {
        type: 'roll',
        label: 'Identificadores',
        items: record.keys.map((k) => ({ id: k, detail: '', status: null })),
      },
    ],
    history,
  }
}

export function searchDemoRoutes(): DemoRoute[] {
  return [
    {
      method: 'GET',
      path: /^\/official-records$/,
      respond: ({ query }) => {
        if (query.get('type')) return null
        const q = (query.get('q') ?? '').trim().toLowerCase()
        const area = query.get('area')
        const from = query.get('from')
        const body = RECORDS_FIXTURE.filter(
          (r) =>
            (!q ||
              r.label.toLowerCase().includes(q) ||
              r.keys.some((k) => k.toLowerCase().includes(q)) ||
              r.source.fileName.toLowerCase().includes(q) ||
              r.source.documentId.toLowerCase() === q) &&
            (!area || r.area === area) &&
            (!from || r.date.slice(0, 10) >= from),
        )
        return { body }
      },
    },
    {
      method: 'GET',
      path: /^\/lineage\/([^/]+)$/,
      respond: ({ match }) => {
        const record = RECORDS_FIXTURE.find((r) => r.id === match[1])
        return record
          ? { body: lineageFor(record) }
          : {
              status: 404,
              body: {
                code: 'NOT_FOUND',
                message: 'No hay trazabilidad para ese dato.',
              },
            }
      },
    },
  ]
}
