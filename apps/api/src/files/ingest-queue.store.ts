// Puerto de encolado de la ingesta (BRIEF #3).
//
// ADR-0011: la API encola, el worker procesa. Este puerto es la única puerta
// por la que la API habla con Redis; el adaptador (`bullmq-ingest-queue.store.ts`)
// es el único que conoce BullMQ.
import type { IngestPayload } from '../queues/ingest-payload.js'

export const INGEST_QUEUE = 'INGEST_QUEUE'

export interface IngestJob extends IngestPayload {
  /** Id del trabajo: el mismo de la fila de `platform.job_run` y del job de BullMQ. */
  jobId: string
}

export interface IngestQueue {
  enqueue(job: IngestJob): Promise<void>
}
