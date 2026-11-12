// Offline unit tests for the reference slice: the service is tested with a
// fake store (the repo pattern — no database in the test), so they run in CI
// and in `bun run verify` without infrastructure.
import { describe, expect, test } from 'bun:test'
import { ApiError } from '../../common/api-error.js'
import { FamiliesService } from './families.service.js'
import type { FamiliesStore, FamilyRow } from './families.store.js'

function fakeStore(rows: FamilyRow[]): FamiliesStore {
  return {
    list: async ({ facilityId, limit, offset }) =>
      rows
        .filter((row) => row.facilityId === facilityId)
        .slice(offset, offset + limit),
    count: async (facilityId) =>
      rows.filter((row) => row.facilityId === facilityId).length,
    findByCode: async (facilityId, familyCode) =>
      rows.find(
        (row) => row.facilityId === facilityId && row.familyCode === familyCode,
      ) ?? null,
  }
}

const ROW: FamilyRow = {
  id: 'fam-1',
  facilityId: 'fac-1',
  familyCode: 'excel_turno',
  name: 'Excel de turno',
  parserKey: 'excel_turno.v1',
  isOcrRequired: false,
}

describe('families service', () => {
  test('lists scoped to the session facility, with total', async () => {
    const service = new FamiliesService(
      fakeStore([ROW, { ...ROW, id: 'fam-2', facilityId: 'fac-2' }]),
    )
    const result = await service.list('fac-1', { limit: 50, offset: 0 })
    const [first] = result.rows
    expect(result.total).toBe(1)
    expect(first?.familyCode).toBe('excel_turno')
  })

  test('honors limit and offset', async () => {
    const rows = [1, 2, 3].map((n) => ({
      ...ROW,
      id: `fam-${n}`,
      familyCode: `f${n}`,
    }))
    const service = new FamiliesService(fakeStore(rows))
    const page = await service.list('fac-1', { limit: 2, offset: 1 })
    expect(page.rows).toHaveLength(2)
    expect(page.rows[0]?.id).toBe('fam-2')
    expect(page.total).toBe(3)
  })

  test('maps to the public DTO only (no internals)', async () => {
    const service = new FamiliesService(fakeStore([ROW]))
    const result = await service.list('fac-1', { limit: 10, offset: 0 })
    expect(Object.keys(result.rows[0] ?? {}).sort()).toEqual([
      'familyCode',
      'id',
      'isOcrRequired',
      'name',
      'parserKey',
    ])
  })

  test('unknown family is a NOT_FOUND envelope', async () => {
    const service = new FamiliesService(fakeStore([]))
    const error = await service
      .getByCode('fac-1', 'no-existe')
      .catch((e: unknown) => e)
    expect(error instanceof ApiError).toBe(true)
    expect((error as ApiError).code).toBe('NOT_FOUND')
  })
})
