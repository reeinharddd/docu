/**
 * DEMO ONLY — local fixture (synthetic, case C1, October 2026) until the
 * corpus of #61 and the API of #12 land. Values come from CASO.md: the
 * Saturday receipt of R-017 without certificate (G2), the TP-01 stop
 * without reason (G1) and Marta's QA release of the substitute roll (G3).
 */
import type { DemoRoute } from '../../../core/middleware/api/demo-backend'
import type { Disposition, InboxItem } from '../model/inbox'

export const QUARANTINE_FIXTURE: InboxItem[] = [
  {
    id: 'q-r017-cert',
    subject: 'Rollo R-017',
    field: 'Certificado de material',
    value: 'No viene en el embarque',
    status: 'quarantine',
    ruleCode: 'R-P1',
    reason:
      'El rollo llegó sin certificado; queda no asignable hasta que llegue.',
    source: {
      fileName: 'recepcion-sab-24oct.xlsx',
      documentId: 'D-10',
      family: 'recepcion_rollo',
    },
    uploadedBy: 'Luis (Almacén)',
    receivedAt: '2026-10-24T09:40:00-07:00',
    requiredPermission: null,
    confirmation: null,
    searchKey: 'R-017',
  },
  {
    id: 'q-r019-medida',
    subject: 'Rollo R-019',
    field: 'Medida de ancho',
    value: '248 mm (pedida: 250 mm)',
    status: 'quarantine',
    ruleCode: 'R-P2',
    reason: 'Calibre menor al de la orden ORD-2026-0047.',
    source: {
      fileName: 'recepcion-sab-24oct.xlsx',
      documentId: 'D-09',
      family: 'recepcion_rollo',
    },
    uploadedBy: 'Luis (Almacén)',
    receivedAt: '2026-10-24T09:41:00-07:00',
    requiredPermission: null,
    confirmation: null,
    searchKey: 'R-019',
  },
  {
    id: 'q-tp01-paro',
    subject: 'Turno TP-01 · T1 · 26-oct',
    field: 'Paro',
    value: '45 min · motivo vacío',
    status: 'quarantine',
    ruleCode: 'R-A1',
    reason: 'El paro pasa de 30 min y no trae motivo; falta capturarlo.',
    source: {
      fileName: 'turno-TP01-T1-2026-10-26.xlsx',
      documentId: 'D-13',
      family: 'excel_turno',
    },
    uploadedBy: 'Carmen (Producción)',
    receivedAt: '2026-10-26T14:05:00-07:00',
    requiredPermission: null,
    confirmation: null,
    searchKey: 'TP-01',
  },
  {
    id: 'q-correo-embarque',
    subject: 'Correo de la hermana · embarque Tyvek',
    field: 'Órdenes afectadas',
    value: 'ORD-2026-0042 · 0043 · 0048',
    status: 'quarantine',
    ruleCode: 'R-P4',
    reason:
      'Cambia lote y fecha del Tyvek: las órdenes pasan a replan y el reporte del 23-oct queda pausado.',
    source: {
      fileName: 'aviso-embarque-tyvek.eml',
      documentId: 'D-06',
      family: 'correo_hermana',
    },
    uploadedBy: 'Ana (Planeación)',
    receivedAt: '2026-10-23T15:02:00-07:00',
    requiredPermission: null,
    confirmation: null,
    searchKey: 'ORD-2026-0042',
  },
]

export const INBOX_FIXTURE: InboxItem[] = [
  {
    id: 'i-qa-l2610-07',
    subject: 'Liberación QA · lote L-2610-07 (rollo R-021)',
    field: 'Peel test',
    value: 'Aprobado · firma presente',
    status: 'pending',
    ruleCode: 'R-Q1',
    reason:
      'Solo Calidad puede liberar; el rollo R-021 es el sustituto de R-017.',
    source: {
      fileName: 'peel-test-L2610-07.pdf',
      documentId: 'D-15',
      family: 'escaneado',
    },
    uploadedBy: 'Marta (Calidad)',
    receivedAt: '2026-10-26T07:20:00-07:00',
    requiredPermission: 'quality.release',
    confirmation: null,
    searchKey: 'R-021',
  },
  {
    id: 'i-conteo-tyvek',
    subject: 'Stock Tyvek MAT-TYV-01',
    field: 'Conteo físico',
    value: '3 rollos (SAP: 5)',
    status: 'pending',
    ruleCode: null,
    reason: 'El conteo no cuadra con SAP; confirma cuál queda como oficial.',
    source: {
      fileName: 'conteo-almacen-26oct.xlsx',
      documentId: 'D-11',
      family: 'inventario',
    },
    uploadedBy: 'Pedro (Almacén)',
    receivedAt: '2026-10-26T07:10:00-07:00',
    requiredPermission: null,
    confirmation: null,
    searchKey: 'MAT-TYV-01',
  },
  {
    id: 'i-merma-tp01',
    subject: 'Merma TP-01 · T1 · 26-oct',
    field: 'Merma',
    value: '36 kg',
    status: 'pending',
    ruleCode: null,
    reason: 'Patrón repetido de la semana; pide confirmación humana (RF-03).',
    source: {
      fileName: 'turno-TP01-T1-2026-10-26.xlsx',
      documentId: 'D-13',
      family: 'excel_turno',
    },
    uploadedBy: 'Carmen (Producción)',
    receivedAt: '2026-10-26T14:05:00-07:00',
    requiredPermission: null,
    confirmation: null,
    searchKey: 'TP-01',
  },
  {
    id: 'i-programa-rev3',
    subject: 'Programa semanal 26–30 oct · revisión 3',
    field: 'Órdenes programadas',
    value: '10 órdenes en 5 máquinas',
    status: 'official',
    ruleCode: null,
    reason: 'Aprobado por el jefe de Materiales.',
    source: {
      fileName: 'programa-semana44-rev3.xlsx',
      documentId: 'D-05',
      family: 'programa_planeacion',
    },
    uploadedBy: 'Ana (Planeación)',
    receivedAt: '2026-10-23T16:05:00-07:00',
    requiredPermission: null,
    confirmation: {
      by: 'Andrés (Materiales)',
      at: '2026-10-23T16:30:00-07:00',
    },
    searchKey: 'ORD-2026-0042',
  },
]

/** Fresh in-memory state per injector: confirm and reject mutate it. */
export function inboxDemoRoutes(): DemoRoute[] {
  const quarantine = structuredClone(QUARANTINE_FIXTURE)
  const inbox = structuredClone(INBOX_FIXTURE)
  let version = 1

  return [
    {
      method: 'GET',
      path: /^\/quarantine$/,
      respond: () => ({ body: quarantine }),
    },
    { method: 'GET', path: /^\/inbox$/, respond: () => ({ body: inbox }) },
    {
      method: 'POST',
      path: /^\/inbox\/([^/]+)\/confirm$/,
      respond: ({ match, user }) => {
        const item = inbox.find((i) => i.id === match[1])
        if (!item) return notFound()
        if (item.status !== 'pending') return alreadyDisposed()
        const at = new Date().toISOString()
        item.status = 'official'
        item.confirmation = { by: user, at }
        const body: Disposition = {
          id: item.id,
          status: 'official',
          version: ++version,
          confirmedAt: at,
        }
        return { body }
      },
    },
    {
      method: 'POST',
      path: /^\/inbox\/([^/]+)\/reject$/,
      respond: ({ match, body, user }) => {
        const index = inbox.findIndex((i) => i.id === match[1])
        const item = inbox[index]
        if (!item) return notFound()
        if (item.status !== 'pending') return alreadyDisposed()
        const reason = (body as { reason?: string } | null)?.reason?.trim()
        if (!reason) {
          return {
            status: 422,
            body: {
              code: 'VALIDATION_ERROR',
              message: 'El motivo es obligatorio.',
            },
          }
        }
        inbox.splice(index, 1)
        quarantine.unshift({
          ...item,
          status: 'quarantine',
          reason: `${reason} (lo mandó ${user})`,
          ruleCode: null,
          receivedAt: new Date().toISOString(),
        })
        const reply: Disposition = {
          id: item.id,
          status: 'quarantine',
          version: ++version,
        }
        return { body: reply }
      },
    },
  ]
}

function notFound() {
  return {
    status: 404,
    body: { code: 'NOT_FOUND', message: 'Ese registro ya no existe.' },
  }
}

function alreadyDisposed() {
  return {
    status: 409,
    body: {
      code: 'CONFLICT',
      message: 'Alguien más ya resolvió este registro.',
    },
  }
}
