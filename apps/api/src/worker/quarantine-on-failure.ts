// Cuarentena de un job que agotó sus reintentos (BRIEF #46).
//
// Un job que falla y se reintenta no es un problema; un job que agota sus
// intentos y se queda solo en el log sí lo es. Al agotarse, el archivo se
// detiene con motivo visible (RF-02) y el original queda intacto
// (REGLAS.md 5): nada se pierde en silencio.

import { SYSTEM_RULE } from './ingest.processor.js'
import type { IngestPipelineStore } from './ingest-pipeline.store.js'

export interface ExhaustedJob {
  sourceFileId: string
  /** Intentos hechos: si es menor que el máximo, todavía se reintenta. */
  attemptsMade: number
  maxAttempts: number
  error: string
}

export function isExhausted(job: {
  attemptsMade: number
  maxAttempts: number
}): boolean {
  return job.attemptsMade >= job.maxAttempts
}

/**
 * Escribe la cuarentena del job agotado. Devuelve `false` si el job todavía
 * tiene reintentos pendientes (no es un fallo definitiva).
 */
export async function quarantineExhaustedJob(
  store: IngestPipelineStore,
  job: ExhaustedJob,
): Promise<boolean> {
  if (!isExhausted(job)) {
    return false
  }
  const source = await store.findSourceFile(job.sourceFileId)
  if (!source) {
    // Sin archivo no hay nada que detener: el job_run ya guarda el error.
    return false
  }
  await store.markParsedRecordQuarantined(job.sourceFileId)
  await store.createQuarantine({
    facilityId: source.facilityId,
    sourceFileId: source.id,
    parsedRecordId: null,
    ruleCode: SYSTEM_RULE.JOB_FAILED,
    severity: 'BLOQUEO',
    reason: `El trabajo agotó sus reintentos: ${job.error}`,
  })
  return true
}
