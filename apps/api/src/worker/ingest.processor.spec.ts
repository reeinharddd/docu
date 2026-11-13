// Spec del pipeline de ingesta (BRIEF #3): qué decide el worker con la
// propuesta del modelo. Nada de base real aquí: los dobles son el punto.
import { describe, expect, it } from 'bun:test'
import type { IngestJob } from '../files/ingest-queue.store.js'
import {
  type IngestOutcome,
  IngestProcessor,
  SYSTEM_RULE,
} from './ingest.processor.js'
import type {
  FamilyOption,
  IngestPipelineStore,
  JobOutcome,
  NewEntityProposal,
  NewOcrResult,
  NewParsedRecord,
  NewQuarantine,
  SourceFileForProcessing,
} from './ingest-pipeline.store.js'
import type { OriginalsReader } from './originals-reader.js'
import type { ProposalEngine } from './proposal-engine.js'

const JOB: IngestJob = {
  jobId: 'ingest:file-1',
  sourceFileId: 'file-1',
  sha256: 'a'.repeat(64),
  familyCode: 'excel_turno',
}

const SOURCE: SourceFileForProcessing = {
  id: 'file-1',
  facilityId: 'fac-1',
  familyConfigId: 'family-1',
  familyCode: 'excel_turno',
  originalName: 'turno.xlsx',
  sha256: 'a'.repeat(64),
  mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  storagePath: 'originales/C1/aaa.xlsx',
  receivedById: 'user-1',
  familySchema: { entityType: 'document' },
}

interface FakeState {
  source: SourceFileForProcessing | null
  families: FamilyOption[]
  entityTypes: Map<string, { id: string }>
  parsedRecords: NewParsedRecord[]
  ocrResults: NewOcrResult[]
  entities: NewEntityProposal[]
  quarantines: NewQuarantine[]
  jobs: { jobId: string; status: string; attempt: number }[]
  finished: JobOutcome[]
  originalsRead: string[]
}

function makeState(overrides: Partial<FakeState> = {}): FakeState {
  return {
    source: SOURCE,
    families: [
      { code: 'excel_turno', name: 'Turno' },
      { code: 'recepcion_rollo', name: 'Recepción' },
    ],
    entityTypes: new Map([['document', { id: 'type-1' }]]),
    parsedRecords: [],
    ocrResults: [],
    entities: [],
    quarantines: [],
    jobs: [],
    finished: [],
    originalsRead: [],
    ...overrides,
  }
}

function fakeStore(state: FakeState): IngestPipelineStore {
  return {
    findSourceFile: async () => state.source,
    listActiveFamilies: async () => state.families,
    findEntityType: async (_facilityId, code) =>
      state.entityTypes.get(code) ?? null,
    createParsedRecord: async (input) => {
      state.parsedRecords.push(input)
      return { id: `parsed-${state.parsedRecords.length}` }
    },
    createOcrResult: async (input) => {
      state.ocrResults.push(input)
      return { id: `ocr-${state.ocrResults.length}` }
    },
    createEntityProposal: async (input) => {
      state.entities.push(input)
      return { id: `entity-${state.entities.length}` }
    },
    createQuarantine: async (input) => {
      state.quarantines.push(input)
      return { id: `quarantine-${state.quarantines.length}` }
    },
    markJobRunning: async (jobId) => {
      state.jobs.push({ jobId, status: 'running', attempt: 1 })
    },
    finishJob: async (jobId, outcome) => {
      state.finished.push(outcome)
      const job = state.jobs.find((row) => row.jobId === jobId)
      if (job) {
        job.status = outcome.status
      }
    },
  }
}

function fakeOriginals(state: FakeState): OriginalsReader {
  return {
    read: async (storagePath) => {
      state.originalsRead.push(storagePath)
      return Buffer.from('contenido', 'utf8')
    },
  }
}

function fakeEngine(overrides: Partial<ProposalEngine> = {}): ProposalEngine {
  return {
    recognize: async () => ({ text: 'texto extraído' }),
    classify: async () => ({ label: 'excel_turno', confidence: 0.95 }),
    mapFields: async () => ({ turno_id: 'T1' }),
    ...overrides,
  }
}

function processor(
  state: FakeState,
  engine: ProposalEngine = fakeEngine(),
): IngestProcessor {
  return new IngestProcessor(fakeStore(state), fakeOriginals(state), engine, {
    autoThreshold: 0.9,
    reviewThreshold: 0.6,
    language: 'es',
  })
}

describe('IngestProcessor', () => {
  it('propone el dato: la propuesta llega a la bandeja en pending_confirmation', async () => {
    const state = makeState()

    const outcome = await processor(state).process(JOB)

    expect(outcome.outcome).toBe('proposed')
    expect(state.entities).toHaveLength(1)
    expect(state.entities[0]?.code).toBe(SOURCE.sha256)
    expect(state.entities[0]?.entityTypeId).toBe('type-1')
    expect(state.entities[0]?.sourceFileId).toBe('file-1')
    expect(state.parsedRecords[0]?.status).toBe('parsed')
    expect(state.ocrResults[0]?.textContent).toBe('texto extraído')
    expect(state.quarantines).toHaveLength(0)
    expect(state.finished[0]?.status).toBe('done')
  })

  it('manda a cuarentena con motivo cuando la confianza es baja', async () => {
    const state = makeState()
    const engine = fakeEngine({
      classify: async () => ({ label: 'excel_turno', confidence: 0.4 }),
    })

    const outcome = (await processor(state, engine).process(
      JOB,
    )) as IngestOutcome & {
      outcome: 'quarantined'
    }

    expect(outcome.outcome).toBe('quarantined')
    expect(state.quarantines).toHaveLength(1)
    expect(state.quarantines[0]?.ruleCode).toBe(SYSTEM_RULE.LOW_CONFIDENCE)
    expect(state.quarantines[0]?.severity).toBe('BLOQUEO')
    expect(state.quarantines[0]?.reason).toContain('0.40')
    expect(state.quarantines[0]?.sourceFileId).toBe('file-1')
    expect(state.parsedRecords[0]?.status).toBe('quarantined')
    expect(state.entities).toHaveLength(0)
  })

  it('manda a cuarentena cuando la familia propuesta no es la declarada', async () => {
    const state = makeState()
    const engine = fakeEngine({
      classify: async () => ({ label: 'recepcion_rollo', confidence: 0.95 }),
    })

    const outcome = (await processor(state, engine).process(
      JOB,
    )) as IngestOutcome & {
      outcome: 'quarantined'
    }

    expect(outcome.outcome).toBe('quarantined')
    expect(state.quarantines[0]?.ruleCode).toBe(
      SYSTEM_RULE.FAMILY_CONTRADICTION,
    )
    expect(state.quarantines[0]?.reason).toContain('recepcion_rollo')
    expect(state.entities).toHaveLength(0)
  })

  it('sin tipo de entidad declarado, deja la extracción y no propone entidad', async () => {
    const state = makeState({
      source: { ...SOURCE, familySchema: { fields: [] } },
    })

    const outcome = await processor(state).process(JOB)

    expect(outcome.outcome).toBe('proposed')
    expect(state.entities).toHaveLength(0)
    expect(state.parsedRecords).toHaveLength(1)
  })

  it('el fallo del motor deja el job fallido con su motivo', async () => {
    const state = makeState()
    const engine = fakeEngine({
      recognize: async () => {
        throw new Error('motor de OCR caído')
      },
    })

    const error = await processor(state, engine)
      .process(JOB)
      .catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(Error)
    expect(state.finished[0]?.status).toBe('failed')
    expect(state.finished[0]?.error).toContain('motor de OCR caído')
  })

  it('si el archivo no existe, el job falla sin escribir nada', async () => {
    const state = makeState({ source: null })

    const error = await processor(state)
      .process(JOB)
      .catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(Error)
    expect(state.parsedRecords).toHaveLength(0)
    expect(state.finished).toHaveLength(0)
  })
})
