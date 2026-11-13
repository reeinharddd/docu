// Spec de la cuarentena al agotar los reintentos (BRIEF #46): un job que
// falla y se reintenta no es un problema; uno que agota sus intentos y se
// queda solo en el log sí lo es.
import { describe, expect, it } from 'bun:test'
import { SYSTEM_RULE } from './ingest.processor.js'
import type {
  IngestPipelineStore,
  NewQuarantine,
  SourceFileForProcessing,
} from './ingest-pipeline.store.js'
import { isExhausted, quarantineExhaustedJob } from './quarantine-on-failure.js'

const SOURCE: SourceFileForProcessing = {
  id: 'file-1',
  facilityId: 'fac-1',
  familyConfigId: 'family-1',
  familyCode: 'excel_turno',
  originalName: 'turno.xlsx',
  sha256: 'a'.repeat(64),
  mimeType: 'application/pdf',
  storagePath: 'originales/C1/aaa.pdf',
  receivedById: 'user-1',
  familySchema: { entityType: 'document' },
}

function fakeStore(source: SourceFileForProcessing | null): {
  store: IngestPipelineStore
  quarantines: NewQuarantine[]
  marked: string[]
} {
  const quarantines: NewQuarantine[] = []
  const marked: string[] = []
  const store: IngestPipelineStore = {
    findSourceFile: async () => source,
    listActiveFamilies: async () => [],
    findEntityType: async () => null,
    createParsedRecord: async () => ({ id: 'parsed-1' }),
    createOcrResult: async () => ({ id: 'ocr-1' }),
    createEntityProposal: async () => ({ id: 'entity-1' }),
    createQuarantine: async (input) => {
      quarantines.push(input)
      return { id: 'quarantine-1' }
    },
    markParsedRecordQuarantined: async (sourceFileId) => {
      marked.push(sourceFileId)
    },
    markJobRunning: async () => undefined,
    finishJob: async () => undefined,
  }
  return { store, quarantines, marked }
}

describe('isExhausted', () => {
  it('es agotado solo cuando se hicieron todos los intentos', () => {
    expect(isExhausted({ attemptsMade: 1, maxAttempts: 3 })).toBe(false)
    expect(isExhausted({ attemptsMade: 3, maxAttempts: 3 })).toBe(true)
    expect(isExhausted({ attemptsMade: 4, maxAttempts: 3 })).toBe(true)
  })
})

describe('quarantineExhaustedJob', () => {
  it('detiene el archivo con motivo visible cuando se agotaron los reintentos', async () => {
    const { store, quarantines, marked } = fakeStore(SOURCE)

    const done = await quarantineExhaustedJob(store, {
      sourceFileId: 'file-1',
      attemptsMade: 3,
      maxAttempts: 3,
      error: 'el motor de OCR no responde',
    })

    expect(done).toBe(true)
    expect(quarantines).toHaveLength(1)
    expect(quarantines[0]?.ruleCode).toBe(SYSTEM_RULE.JOB_FAILED)
    expect(quarantines[0]?.severity).toBe('BLOQUEO')
    expect(quarantines[0]?.reason).toContain('el motor de OCR no responde')
    expect(quarantines[0]?.sourceFileId).toBe('file-1')
    expect(marked).toEqual(['file-1'])
  })

  it('no detiene nada si todavía quedan reintentos', async () => {
    const { store, quarantines } = fakeStore(SOURCE)

    const done = await quarantineExhaustedJob(store, {
      sourceFileId: 'file-1',
      attemptsMade: 1,
      maxAttempts: 3,
      error: 'fallo puntual',
    })

    expect(done).toBe(false)
    expect(quarantines).toHaveLength(0)
  })

  it('sin archivo no hay nada que detener', async () => {
    const { store, quarantines } = fakeStore(null)

    const done = await quarantineExhaustedJob(store, {
      sourceFileId: 'file-1',
      attemptsMade: 3,
      maxAttempts: 3,
      error: 'boom',
    })

    expect(done).toBe(false)
    expect(quarantines).toHaveLength(0)
  })
})
