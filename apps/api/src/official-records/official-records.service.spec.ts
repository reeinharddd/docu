// Spec del servicio de dato oficial (BRIEF #12): el listado sale de la vista
// `truth.official_record`, que solo contiene lo ya confirmado.
import { describe, expect, it } from 'bun:test'
import { OfficialRecordsService } from './official-records.service.js'
import {
  type OfficialRecordRow,
  type OfficialRecordsStore,
} from './official-records.store.js'

const ROW: OfficialRecordRow = {
  id: 'entity-1',
  code: 'R-001',
  entityTypeCode: 'turno',
  entityTypeName: 'Turno',
  data: { turno: 'nocturno' },
  version: 2,
  confirmedByUsername: 'marta',
  confirmedByName: 'Marta Ruiz',
  confirmedAt: new Date('2026-11-12T12:00:00Z'),
  sourceFileId: 'file-1',
  updatedAt: new Date('2026-11-12T12:00:00Z'),
}

function fakeStore(
  overrides: Partial<OfficialRecordsStore> = {},
): OfficialRecordsStore {
  return {
    listOfficial: async () => [ROW],
    countOfficial: async () => 1,
    ...overrides,
  }
}

describe('OfficialRecordsService.list', () => {
  it('mapea el registro oficial con su responsable', async () => {
    const service = new OfficialRecordsService(fakeStore())

    const { rows, total } = await service.list('facility-1', {
      limit: 50,
      offset: 0,
    })

    expect(total).toBe(1)
    expect(rows).toEqual([
      {
        id: 'entity-1',
        code: 'R-001',
        entityType: { code: 'turno', name: 'Turno' },
        data: { turno: 'nocturno' },
        version: 2,
        confirmedBy: { username: 'marta', fullName: 'Marta Ruiz' },
        confirmedAt: '2026-11-12T12:00:00.000Z',
        sourceFileId: 'file-1',
        updatedAt: '2026-11-12T12:00:00.000Z',
      },
    ])
  })

  it('deja el responsable vacío cuando la vista no lo trae', async () => {
    const service = new OfficialRecordsService(
      fakeStore({
        listOfficial: async () => [{ ...ROW, confirmedByUsername: null }],
      }),
    )

    const { rows } = await service.list('facility-1', {
      limit: 50,
      offset: 0,
    })

    expect(rows[0]?.confirmedBy).toBeNull()
  })
})
