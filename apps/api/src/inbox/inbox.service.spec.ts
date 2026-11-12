// Spec del servicio de bandeja (BRIEF #12): el servicio posee las reglas de
// disposición (404 / 409 / 422) y no toca la base; la base entra por el puerto.
import { describe, expect, it } from 'bun:test'
import { ApiError } from '../common/api-error.js'
import { InboxService } from './inbox.service.js'
import {
  type DispositionOutcome,
  type InboxProposalRow,
  type InboxStore,
} from './inbox.store.js'

const PROPOSAL: InboxProposalRow = {
  id: 'entity-1',
  code: 'R-001',
  status: 'pending_confirmation',
  version: 1,
  data: { turno: 'nocturno' },
  entityTypeCode: 'turno',
  entityTypeName: 'Turno',
  sourceFileId: 'file-1',
  sourceOriginalName: 'recepcion.xlsx',
  updatedAt: new Date('2026-11-12T10:00:00Z'),
}

const USER = {
  sessionId: 'session-1',
  userId: 'user-1',
  facilityId: 'facility-1',
  facilityCode: 'c1',
  username: 'marta',
  fullName: 'Marta Ruiz',
  roles: ['manager'],
  permissions: ['read', 'confirm'],
}

function fakeStore(overrides: Partial<InboxStore> = {}): InboxStore {
  return {
    listPending: async () => [PROPOSAL],
    countPending: async () => 1,
    confirm: async (): Promise<DispositionOutcome> => ({
      outcome: 'confirmed',
      id: 'entity-1',
      status: 'official',
      version: 2,
      confirmedAt: new Date('2026-11-12T12:00:00Z'),
    }),
    reject: async (): Promise<DispositionOutcome> => ({
      outcome: 'rejected',
      id: 'entity-1',
      status: 'rejected',
      version: 2,
    }),
    ...overrides,
  }
}

describe('InboxService.list', () => {
  it('mapea la propuesta sin filtrar internals de la instalación', async () => {
    const service = new InboxService(fakeStore())

    const { rows, total } = await service.list('facility-1', {
      limit: 50,
      offset: 0,
    })

    expect(total).toBe(1)
    expect(rows).toEqual([
      {
        id: 'entity-1',
        code: 'R-001',
        status: 'pending_confirmation',
        version: 1,
        data: { turno: 'nocturno' },
        entityType: { code: 'turno', name: 'Turno' },
        source: { id: 'file-1', originalName: 'recepcion.xlsx' },
        updatedAt: '2026-11-12T10:00:00.000Z',
      },
    ])
  })
})

describe('InboxService.confirm', () => {
  it('confirma y devuelve la disposición', async () => {
    const service = new InboxService(fakeStore())

    const result = await service.confirm('facility-1', 'entity-1', USER)

    expect(result).toEqual({
      id: 'entity-1',
      status: 'official',
      version: 2,
      confirmedAt: '2026-11-12T12:00:00.000Z',
    })
  })

  it('exige que la propuesta exista en la instalación (404)', async () => {
    const service = new InboxService(
      fakeStore({
        confirm: async () => ({ outcome: 'not-found' }),
      }),
    )

    const error = await service
      .confirm('facility-1', 'entity-1', USER)
      .catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).getStatus()).toBe(404)
  })

  it('rechaza una propuesta que no está en revisión (422)', async () => {
    const service = new InboxService(
      fakeStore({
        confirm: async () => ({ outcome: 'not-in-review' }),
      }),
    )

    const error = await service
      .confirm('facility-1', 'entity-1', USER)
      .catch((caught: unknown) => caught)

    expect((error as ApiError).getStatus()).toBe(422)
  })

  it('rechaza una propuesta ya disposeada (409)', async () => {
    const service = new InboxService(
      fakeStore({
        confirm: async () => ({ outcome: 'already-disposed' }),
      }),
    )

    const error = await service
      .confirm('facility-1', 'entity-1', USER)
      .catch((caught: unknown) => caught)

    expect((error as ApiError).getStatus()).toBe(409)
  })

  it('rechaza una propuesta sin documento de origen (422)', async () => {
    const service = new InboxService(
      fakeStore({
        confirm: async () => ({ outcome: 'no-origin' }),
      }),
    )

    const error = await service
      .confirm('facility-1', 'entity-1', USER)
      .catch((caught: unknown) => caught)

    expect((error as ApiError).getStatus()).toBe(422)
  })
})

describe('InboxService.reject', () => {
  it('rechaza y devuelve la disposición sin fecha de confirmación', async () => {
    const service = new InboxService(fakeStore())

    const result = await service.reject('facility-1', 'entity-1', USER)

    expect(result).toEqual({
      id: 'entity-1',
      status: 'rejected',
      version: 2,
    })
  })
})
