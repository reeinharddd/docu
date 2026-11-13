// Límites de la cola y del worker: son configuración, no constantes en el
// código (COLAS.md). El worker comparte imagen con la API, así que su
// concurrencia y su memoria se fijan de forma explícita en vez de heredarse.
export interface QueueSettings {
  /** Intentos totales por job (BullMQ: 1 = sin reintentos). */
  attempts: number
  /** Espera del primer reintento; el backoff es exponencial. */
  backoffMs: number
}

export interface WorkerSettings extends QueueSettings {
  /** Jobs simultáneos por worker. */
  concurrency: number
  /** Milisegundos que BullMQ espera para renovar el lock de un job. */
  lockMs: number
}

type Env = Record<string, string | undefined>

function readInt(env: Env, key: string, fallback: number, min: number): number {
  const parsed = Number(env[key])
  if (!Number.isFinite(parsed) || parsed < min) {
    return fallback
  }
  return Math.floor(parsed)
}

export function queueSettingsFromEnv(env: Env = process.env): QueueSettings {
  return {
    attempts: readInt(env, 'INGEST_ATTEMPTS', 3, 1),
    backoffMs: readInt(env, 'INGEST_BACKOFF_MS', 5000, 100),
  }
}

export function workerSettingsFromEnv(env: Env = process.env): WorkerSettings {
  return {
    ...queueSettingsFromEnv(env),
    concurrency: readInt(env, 'WORKER_CONCURRENCY', 2, 1),
    lockMs: readInt(env, 'WORKER_LOCK_MS', 30000, 1000),
  }
}
