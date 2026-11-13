// Los nombres de cola son dato, no constantes dispersas (COLAS.md): el ER los
// fija con un CHECK en `platform.job_run.queue` y todo el que encola tiene que
// decir exactamente lo mismo.
export const QUEUE_INGEST = 'ingest'
export const QUEUE_TEXT = 'text'
export const QUEUE_REPORTS = 'reports'
export const QUEUE_ALERTS = 'alerts'

export type QueueName =
  | typeof QUEUE_INGEST
  | typeof QUEUE_TEXT
  | typeof QUEUE_REPORTS
  | typeof QUEUE_ALERTS
