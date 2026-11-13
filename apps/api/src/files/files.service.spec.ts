// Offline unit tests of the ingestion rules (POST /v1/files):
// server-side sha256, family/type/size validation, idempotent registration
// per (facility, sha256), and the ingest job + audit trail.
import { describe, expect, test } from 'bun:test'
import type { SessionUser } from '../auth/auth.service.js'
import { ApiError } from '../common/api-error.js'
import { FilesService, uploadOptionsFromEnv } from './files.service.js'
import type {
  FailedJobRun,
  FamilyConfigRow,
  FilesStore,
  NewAuditEntry,
  NewJobRun,
  NewSourceFile,
} from './files.store.js'
import type { IngestJob, IngestQueue } from './ingest-queue.store.js'
import type { OriginalsStore } from './originals.store.js'

interface FakeState {
  families: FamilyConfigRow[]
  files: NewSourceFile[]
  fileIdBySha: Map<string, string>
  jobs: NewJobRun[]
  failedJobs: FailedJobRun[]
  queued: IngestJob[]
  audit: NewAuditEntry[]
  savedOriginals: string[]
  failOriginals?: boolean
  failQueue?: boolean
}

function family(overrides: Partial<FamilyConfigRow> = {}): FamilyConfigRow {
  return {
    id: 'family-1',
    facilityId: 'fac-1',
    familyCode: 'PROG',
    name: 'Programa de producción',
    parserKey: 'programa',
    isOcrRequired: false,
    isActive: true,
    ...overrides,
  }
}

function fakeStore(state: FakeState): FilesStore {
  return {
    findFamilyConfig: async (facilityId, familyCode) =>
      state.families.find(
        (f) => f.facilityId === facilityId && f.familyCode === familyCode,
      ) ?? null,
    findFileIdBySha256: async (facilityId, sha256) =>
      state.fileIdBySha.get(`${facilityId}|${sha256}`) ?? null,
    createSourceFile: async (input) => {
      state.files.push(input)
      const id = `file-${state.files.length}`
      state.fileIdBySha.set(`${input.facilityId}|${input.sha256}`, id)
      return { id }
    },
    createJobRun: async (input) => {
      state.jobs.push(input)
    },
    markJobFailed: async (input) => {
      state.failedJobs.push(input)
    },
    createAuditEntry: async (input) => {
      state.audit.push(input)
    },
  }
}

function fakeQueue(state: FakeState): IngestQueue {
  return {
    enqueue: async (job) => {
      if (state.failQueue) {
        throw new Error('redis no responde')
      }
      state.queued.push(job)
    },
  }
}

function fakeOriginals(state: FakeState): OriginalsStore {
  return {
    save: async (input) => {
      if (state.failOriginals) {
        throw new Error('disk full')
      }
      const path = `originales/${input.facilityCode}/${input.sha256}`
      state.savedOriginals.push(path)
      return path
    },
  }
}

const user: SessionUser = {
  sessionId: 'session-1',
  userId: 'user-1',
  facilityId: 'fac-1',
  facilityCode: 'C1',
  username: 'andres',
  fullName: 'Andrés',
  roles: ['operador'],
  permissions: ['create', 'submit', 'read'],
}

function makeState(
  families: FamilyConfigRow[],
  overrides: Partial<FakeState> = {},
): FakeState {
  return {
    families,
    files: [],
    fileIdBySha: new Map(),
    jobs: [],
    failedJobs: [],
    queued: [],
    audit: [],
    savedOriginals: [],
    ...overrides,
  }
}

function bytes(text: string): Buffer {
  return Buffer.from(text, 'utf8')
}

function service(
  state: FakeState,
  options?: { maxBytes: number },
): FilesService {
  return new FilesService(
    fakeStore(state),
    fakeOriginals(state),
    fakeQueue(state),
    options ?? { maxBytes: 1024 },
  )
}

const input = {
  familyCode: 'PROG',
  originalName: 'programa-2026-11-12.xlsx',
  mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  byteSize: bytes('contenido').length,
  bytes: bytes('contenido'),
}

describe('uploadOptionsFromEnv', () => {
  test('sin env usa 50 MB', () => {
    expect(uploadOptionsFromEnv({}).maxBytes).toBe(50 * 1024 * 1024)
  })

  test('valor invalido cae al por defecto', () => {
    expect(uploadOptionsFromEnv({ UPLOAD_MAX_BYTES: 'grande' }).maxBytes).toBe(
      50 * 1024 * 1024,
    )
  })
})

describe('files service', () => {
  test('registra el archivo: hash en servidor, job en ingest y auditoría', async () => {
    const state: FakeState = makeState([family()])
    const result = await service(state).register(input, user, {
      ipAddress: '10.0.0.5',
    })

    expect(result.sourceFileId).toBe('file-1')
    expect(result.sha256).toHaveLength(64)
    expect(state.savedOriginals).toEqual([`originales/C1/${result.sha256}`])
    expect(state.files[0]?.sha256).toBe(result.sha256)
    expect(state.files[0]?.byteSize).toBe(BigInt(input.byteSize))
    expect(state.files[0]?.storagePath).toBe(`originales/C1/${result.sha256}`)
    expect(state.files[0]?.receivedById).toBe('user-1')
    expect(state.jobs[0]?.queue).toBe('ingest')
    expect(state.jobs[0]?.jobId).toBe(result.sourceFileId)
    expect(state.jobs[0]?.input).toEqual({
      sourceFileId: 'file-1',
      familyCode: 'PROG',
      sha256: result.sha256,
    })
    expect(state.audit[0]?.action).toBe('file.received')
    expect(state.audit[0]?.targetTable).toBe('ingest.source_file')
    expect(state.audit[0]?.targetId).toBe('file-1')
    expect(state.audit[0]?.ipAddress).toBe('10.0.0.5')
  })

  test('el mismo archivo en la misma instalación es 409 que apunta al original', async () => {
    const state: FakeState = makeState([family()])
    const serviceWith = service(state)
    await serviceWith.register(input, user)
    const error = await serviceWith
      .register(input, user)
      .catch((e: unknown) => e)

    expect((error as ApiError).code).toBe('CONFLICT')
    expect((error as ApiError).message).toBe('El archivo ya fue registrado.')
    expect((error as ApiError).details.sourceFileId).toBe('file-1')
    expect((error as ApiError).details.sha256).toHaveLength(64)
    expect(state.files).toHaveLength(1)
    expect(state.jobs).toHaveLength(1)
  })

  test('el mismo hash en OTRA instalación no colisiona (aislamiento)', async () => {
    const state: FakeState = makeState([
      family(),
      family({ id: 'family-2', facilityId: 'fac-2' }),
    ])
    const serviceWith = service(state)
    await serviceWith.register(input, user)
    const otherFacility: SessionUser = {
      ...user,
      facilityId: 'fac-2',
      facilityCode: 'C2',
    }
    const result = await serviceWith.register(input, otherFacility)
    expect(result.sourceFileId).toBe('file-2')
    expect(state.files).toHaveLength(2)
  })

  test('familia desconocida o inactiva es 422', async () => {
    const state: FakeState = makeState([family({ isActive: false })])
    const error = await service(state)
      .register(input, user)
      .catch((e: unknown) => e)
    expect((error as ApiError).code).toBe('VALIDATION_ERROR')
    expect(state.files).toHaveLength(0)
  })

  test('tipo no permitido es 422', async () => {
    const state: FakeState = makeState([family()])
    const error = await service(state)
      .register({ ...input, mimeType: 'application/zip' }, user)
      .catch((e: unknown) => e)
    expect((error as ApiError).code).toBe('VALIDATION_ERROR')
    expect(state.files).toHaveLength(0)
  })

  test('archivo que excede el tamaño es 422', async () => {
    const state: FakeState = makeState([family()])
    const error = await service(state, { maxBytes: 4 })
      .register(input, user)
      .catch((e: unknown) => e)
    expect((error as ApiError).code).toBe('VALIDATION_ERROR')
    expect((error as ApiError).message).toContain('tamaño máximo')
    expect(state.files).toHaveLength(0)
  })

  test('encola el trabajo con el mismo jobId de la fila del job', async () => {
    const state: FakeState = makeState([family()])
    const result = await service(state).register(input, user)

    expect(state.queued).toHaveLength(1)
    expect(state.queued[0]?.jobId).toBe(result.sourceFileId)
    expect(state.queued[0]?.sourceFileId).toBe(result.sourceFileId)
    expect(state.queued[0]?.sha256).toBe(result.sha256)
    expect(state.queued[0]?.familyCode).toBe('PROG')
  })

  test('si la cola no acepta el trabajo, el job queda fallido con motivo (500)', async () => {
    const state: FakeState = makeState([family()], { failQueue: true })
    const error = await service(state)
      .register(input, user)
      .catch((e: unknown) => e)

    expect((error as ApiError).code).toBe('INTERNAL')
    expect(state.failedJobs).toHaveLength(1)
    expect(state.failedJobs[0]?.jobId).toBe('file-1')
    expect(state.failedJobs[0]?.error).toContain('redis no responde')
    // El archivo queda registrado: no se borra nada en silencio.
    expect(state.files).toHaveLength(1)
  })

  test('si los originales no se pueden escribir, no se registra nada (500)', async () => {
    const state: FakeState = makeState([family()], { failOriginals: true })
    const error = await service(state)
      .register(input, user)
      .catch((e: unknown) => e)
    expect((error as ApiError).code).toBe('INTERNAL')
    expect(state.files).toHaveLength(0)
    expect(state.jobs).toHaveLength(0)
    expect(state.audit).toHaveLength(0)
  })
})
