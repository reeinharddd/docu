/**
 * DEMO ONLY — week 26–30 Oct 2026 of plant C1 (synthetic) until the corpus
 * of #61 lands. Monday of the ghost roll (G4/G5): R-017 without certificate
 * blocks the three orders that hang from it, R-019 is narrower than ordered,
 * foil is missing for TB-03 and Tyvek is under the minimum on Tuesday.
 */
import type { DemoRoute } from '../../../core/middleware/api/demo-backend'
import type { ScheduleEntry, WeekSchedule } from '../model/schedule'

const POUCH = 'Pouch Tyvek-film 150×200'
const BAG = 'Header bag 250×400'

const ENTRIES: ScheduleEntry[] = [
  {
    id: 'e01',
    day: '2026-10-26',
    shift: 'T1',
    machine: 'TP-01',
    orderId: 'ORD-2026-0042',
    product: POUCH,
    materialId: 'MAT-TYV-01',
    rollId: 'R-017',
    plannedQty: 12000,
    unit: 'pzas',
    state: 'blocked',
    blocks: ['R-P1', 'R-P4'],
  },
  {
    id: 'e02',
    day: '2026-10-26',
    shift: 'T1',
    machine: 'TP-02',
    orderId: 'ORD-2026-0047',
    product: POUCH,
    materialId: 'MAT-TYV-01',
    rollId: 'R-019',
    plannedQty: 9000,
    unit: 'pzas',
    state: 'blocked',
    blocks: ['R-P2'],
  },
  {
    id: 'e03',
    day: '2026-10-26',
    shift: 'T1',
    machine: 'TB-01',
    orderId: 'ORD-2026-0039',
    product: BAG,
    materialId: 'MAT-FLM-02',
    rollId: 'R-012',
    plannedQty: 5000,
    unit: 'pzas',
    state: 'assignable',
    blocks: [],
  },
  {
    id: 'e04',
    day: '2026-10-26',
    shift: 'T2',
    machine: 'TP-01',
    orderId: 'ORD-2026-0043',
    product: POUCH,
    materialId: 'MAT-TYV-01',
    rollId: 'R-017',
    plannedQty: 8000,
    unit: 'pzas',
    state: 'blocked',
    blocks: ['R-P1', 'R-P4'],
  },
  {
    id: 'e05',
    day: '2026-10-26',
    shift: 'T2',
    machine: 'TB-02',
    orderId: 'ORD-2026-0040',
    product: BAG,
    materialId: 'MAT-FLM-02',
    rollId: 'R-013',
    plannedQty: 5000,
    unit: 'pzas',
    state: 'assignable',
    blocks: [],
  },
  {
    id: 'e06',
    day: '2026-10-26',
    shift: 'T3',
    machine: 'TB-03',
    orderId: 'ORD-2026-0044',
    product: 'Header bag foil 200×300',
    materialId: 'MAT-FOI-01',
    rollId: null,
    plannedQty: 4000,
    unit: 'pzas',
    state: 'blocked',
    blocks: ['R-P3'],
  },
  {
    id: 'e07',
    day: '2026-10-27',
    shift: 'T1',
    machine: 'TP-01',
    orderId: 'ORD-2026-0048',
    product: POUCH,
    materialId: 'MAT-TYV-01',
    rollId: 'R-017',
    plannedQty: 10000,
    unit: 'pzas',
    state: 'replan',
    blocks: ['R-P4', 'R-P1'],
  },
  {
    id: 'e08',
    day: '2026-10-27',
    shift: 'T1',
    machine: 'TP-02',
    orderId: 'ORD-2026-0045',
    product: POUCH,
    materialId: 'MAT-TYV-01',
    rollId: null,
    plannedQty: 7000,
    unit: 'pzas',
    state: 'blocked',
    blocks: ['R-T1'],
  },
  {
    id: 'e09',
    day: '2026-10-27',
    shift: 'T2',
    machine: 'TB-01',
    orderId: 'ORD-2026-0046',
    product: BAG,
    materialId: 'MAT-FLM-02',
    rollId: 'R-014',
    plannedQty: 5000,
    unit: 'pzas',
    state: 'assignable',
    blocks: [],
  },
  {
    id: 'e10',
    day: '2026-10-28',
    shift: 'T1',
    machine: 'TB-02',
    orderId: 'ORD-2026-0049',
    product: BAG,
    materialId: 'MAT-FLM-02',
    rollId: 'R-015',
    plannedQty: 6000,
    unit: 'pzas',
    state: 'committed',
    blocks: [],
  },
]

export const SCHEDULE_FIXTURE: WeekSchedule = {
  week: '2026-10-26',
  revision: 3,
  source: {
    fileName: 'programa-semana44-rev3.xlsx',
    documentId: 'D-05',
    family: 'programa_planeacion',
  },
  confirmation: { by: 'Andrés (Materiales)', at: '2026-10-23T16:30:00-07:00' },
  syncedAt: '2026-10-26T05:45:00-07:00',
  entries: ENTRIES,
}

export function scheduleDemoRoutes(): DemoRoute[] {
  let job = 1
  return [
    {
      method: 'GET',
      path: /^\/official-records$/,
      respond: ({ query }) => {
        if (query.get('type') !== 'production_schedule') return null
        const week = query.get('week') ?? SCHEDULE_FIXTURE.week
        const body: WeekSchedule =
          week === SCHEDULE_FIXTURE.week
            ? structuredClone(SCHEDULE_FIXTURE)
            : { ...structuredClone(SCHEDULE_FIXTURE), week, entries: [] }
        return { body }
      },
    },
    {
      method: 'POST',
      path: /^\/sources\/([^/]+)\/sync$/,
      respond: () => ({ status: 202, body: { jobId: `job-${job++}` } }),
    },
  ]
}
