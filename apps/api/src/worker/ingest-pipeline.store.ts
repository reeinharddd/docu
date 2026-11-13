// Pipeline de ingesta — puerto del worker (BRIEF #3).
//
// El worker es quien escribe: recibe, extrae, propone y deja el veredicto.
// Este puerto es la superficie que necesita de la base; el adaptador
// (`prisma-ingest-pipeline.store.ts`) es el único que ve Prisma.
export const INGEST_PIPELINE_STORE = 'INGEST_PIPELINE_STORE'

export interface SourceFileForProcessing {
  id: string
  facilityId: string
  familyConfigId: string
  familyCode: string
  originalName: string
  sha256: string
  mimeType: string
  storagePath: string
  /** Quién subió el archivo: el pipeline trabaja en nombre de esa persona. */
  receivedById: string
  /** `config.family_config.schema_definition`: los datos de la familia. */
  familySchema: unknown
}

export interface FamilyOption {
  code: string
  name: string
}

export interface NewParsedRecord {
  facilityId: string
  sourceFileId: string
  familyConfigId: string
  recordIndex: number
  payload: unknown
  status: string
  createdById: string
}

export interface NewEntityProposal {
  facilityId: string
  entityTypeId: string
  code: string
  data: unknown
  sourceFileId: string
  createdById: string
}

export interface NewQuarantine {
  facilityId: string
  sourceFileId: string
  parsedRecordId: string | null
  ruleCode: string
  severity: string
  reason: string
}

export interface NewOcrResult {
  facilityId: string
  sourceFileId: string
  parsedRecordId: string | null
  engine: string
  engineVersion: string
  language: string
  textContent: string
}

export interface JobOutcome {
  status: string
  output: Record<string, unknown> | null
  error: string | null
}

export interface IngestPipelineStore {
  findSourceFile(sourceFileId: string): Promise<SourceFileForProcessing | null>
  listActiveFamilies(facilityId: string): Promise<FamilyOption[]>
  findEntityType(
    facilityId: string,
    code: string,
  ): Promise<{ id: string } | null>
  createParsedRecord(input: NewParsedRecord): Promise<{ id: string }>
  createOcrResult(input: NewOcrResult): Promise<{ id: string }>
  createEntityProposal(input: NewEntityProposal): Promise<{ id: string }>
  createQuarantine(input: NewQuarantine): Promise<{ id: string }>
  markJobRunning(jobId: string): Promise<void>
  finishJob(jobId: string, outcome: JobOutcome): Promise<void>
}
