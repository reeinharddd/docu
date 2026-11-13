// Las cuatro colas de C1 (COLAS.md). El ER las fija con un CHECK en
// `platform.job_run.queue` y la tabla de este archivo es el único lugar donde
// se declaran: el worker, la API y la salud hablan de las mismas cuatro.
import {
  QUEUE_ALERTS,
  QUEUE_INGEST,
  QUEUE_REPORTS,
  QUEUE_TEXT,
  type QueueName,
} from './queues.js'

export interface QueueDefinition {
  name: QueueName
  /** Qué procesa esta cola. */
  purpose: string
}

export const QUEUE_DEFINITIONS: readonly QueueDefinition[] = [
  {
    name: QUEUE_INGEST,
    purpose: 'Parseo, OCR y validación de lo que entra',
  },
  {
    name: QUEUE_TEXT,
    purpose: 'Texto limpio y embeddings para la búsqueda',
  },
  {
    name: QUEUE_REPORTS,
    purpose: 'Reportes recurrentes',
  },
  {
    name: QUEUE_ALERTS,
    purpose: 'Alertas por umbral',
  },
]

export function queueNames(): QueueName[] {
  return QUEUE_DEFINITIONS.map((definition) => definition.name)
}
