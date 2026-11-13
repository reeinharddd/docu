// Límites de la cola y del worker: son configuración, no constantes en el
// código (COLAS.md). El worker comparte imagen con la API, así que su
// concurrencia y su memoria se fijan de forma explícita en vez de heredarse.
export interface QueueSettings {
  /** Intentos totales por job (BullMQ: 1 = sin reintentos). */
  attempts: number
  /** Espera del primer reintento; el backoff es exponencial. */
  backoffMs: number
  /** Fracción de dispersión del backoff (0 = sin jitter). */
  backoffJitter: number
}

export interface WorkerSettings extends QueueSettings {
  /** Jobs simultáneos por worker. */
  concurrency: number
  /** Milisegundos que BullMQ espera para renovar el lock de un job. */
  lockMs: number
  /** Cada cuánto el worker publica su latido. */
  heartbeatMs: number
  /** Vida del latido en Redis: si no se renueva, el worker está muerto. */
  heartbeatTtlMs: number
}

type Env = Record<string, string | undefined>

function readInt(env: Env, key: string, fallback: number, min: number): number {
  const parsed = Number(env[key])
  if (!Number.isFinite(parsed) || parsed < min) {
    return fallback
  }
  return Math.floor(parsed)
}

function readFloat(
  env: Env,
  key: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = Number(env[key])
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return fallback
  }
  return parsed
}

export function queueSettingsFromEnv(env: Env = process.env): QueueSettings {
  return {
    attempts: readInt(env, 'INGEST_ATTEMPTS', 3, 1),
    backoffMs: readInt(env, 'INGEST_BACKOFF_MS', 5000, 100),
    backoffJitter: readFloat(env, 'INGEST_BACKOFF_JITTER', 0.2, 0, 1),
  }
}

export function workerSettingsFromEnv(env: Env = process.env): WorkerSettings {
  return {
    ...queueSettingsFromEnv(env),
    concurrency: readInt(env, 'WORKER_CONCURRENCY', 2, 1),
    lockMs: readInt(env, 'WORKER_LOCK_MS', 30000, 1000),
    heartbeatMs: readInt(env, 'WORKER_HEARTBEAT_MS', 10000, 1000),
    heartbeatTtlMs: readInt(env, 'WORKER_HEARTBEAT_TTL_MS', 45000, 2000),
  }
}
