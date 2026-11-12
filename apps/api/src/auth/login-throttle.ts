// Login throttle — brute-force protection (SEC-02, auditoría 2026-11-11).
//
// Ventana deslizante en memoria con dos contadores por intento fallido:
//   - `user:<ip>|<username>`: LOGIN_MAX_ATTEMPTS (5 por defecto) dentro de
//     LOGIN_WINDOW_MINUTES (15 por defecto).
//   - `ip:<ip>`: 10× ese tope en la misma ventana, contra sprays que prueban
//     una contraseña en muchos usuarios.
// Un login correcto limpia solo el contador de ip+usuario: el contador de IP
// caduca por ventana, así un atacante no lo rearma acertando la contraseña.
// Bloquear ip+usuario (y no el usuario globalmente) evita negar el servicio
// a una víctima legítima desde otras IPs.
//
// La memoria vive por instancia de la API: con varias instancias el contador
// se reparte y el límite real se multiplica. Migrar a Redis queda anotado en
// CALIDAD-BACKEND §8 como deuda.

export interface LoginThrottleOptions {
  maxAttempts?: number
  windowMs?: number
  now?: () => number
}

const DEFAULT_MAX_ATTEMPTS = 5
const DEFAULT_WINDOW_MS = 15 * 60 * 1000

export interface LoginThrottleOptionsFromEnv {
  maxAttempts: number
  windowMs: number
}

/** Reads the throttle settings from env; bad values fall back to defaults. */
export function loginThrottleOptionsFromEnv(
  env: Record<string, string | undefined> = process.env,
): LoginThrottleOptionsFromEnv {
  const maxAttempts = Number(env.LOGIN_MAX_ATTEMPTS)
  const windowMinutes = Number(env.LOGIN_WINDOW_MINUTES)
  return {
    maxAttempts:
      Number.isFinite(maxAttempts) && maxAttempts > 0
        ? Math.floor(maxAttempts)
        : DEFAULT_MAX_ATTEMPTS,
    windowMs:
      Number.isFinite(windowMinutes) && windowMinutes > 0
        ? windowMinutes * 60 * 1000
        : DEFAULT_WINDOW_MS,
  }
}

export class LoginThrottle {
  private readonly hits = new Map<string, number[]>()
  private readonly maxAttempts: number
  private readonly windowMs: number
  private readonly now: () => number

  constructor(options: LoginThrottleOptions = {}) {
    this.maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS
    this.windowMs = options.windowMs ?? DEFAULT_WINDOW_MS
    this.now = options.now ?? (() => Date.now())
  }

  /** Cap for the per-IP counter: 10× the per-user cap (integer). */
  get maxAttemptsPerIp(): number {
    return this.maxAttempts * 10
  }

  /**
   * Milliseconds the key is still blocked; 0 when the next attempt is
   * allowed. The block lifts when the oldest hit of the window expires.
   */
  blockedFor(key: string): number {
    const nowMs = this.now()
    const hits = (this.hits.get(key) ?? []).filter(
      (at) => nowMs - at < this.windowMs,
    )
    if (hits.length > 0) {
      this.hits.set(key, hits)
    } else {
      this.hits.delete(key)
    }
    const limit = key.startsWith('ip:')
      ? this.maxAttemptsPerIp
      : this.maxAttempts
    if (hits.length < limit) {
      return 0
    }
    const oldest = hits[0]
    if (oldest === undefined) {
      return 0
    }
    return oldest + this.windowMs - nowMs
  }

  /** Records a failed attempt. Prunes the window to keep memory bounded. */
  recordFailure(key: string): void {
    const nowMs = this.now()
    const hits = (this.hits.get(key) ?? []).filter(
      (at) => nowMs - at < this.windowMs,
    )
    hits.push(nowMs)
    this.hits.set(key, hits)
  }

  /** Clears the key (a successful login clears its ip+user counter). */
  reset(key: string): void {
    this.hits.delete(key)
  }
}
