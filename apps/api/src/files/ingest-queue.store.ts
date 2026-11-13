// Puerto de encolado de la ingesta (BRIEF #3).
//
// ADR-0011: la API encola, el worker procesa. Este puerto es la única puerta
// por la que la API habla con Redis; el adaptador (`bullmq-ingest-queue.store.ts`)
// es el único que conoce BullMQ.
export const INGEST_QUEUE = 'INGEST_QUEUE'

export interface IngestJob {
  /** Mismo identificador que la fila de `platform.job_run`: una corrida, una fila. */
  jobId: string
  sourceFileId: string
  sha256: string
  familyCode: string
}

export interface IngestQueue {
  enqueue(job: IngestJob): Promise<void>
}
