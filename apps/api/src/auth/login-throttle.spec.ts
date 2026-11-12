// Offline unit tests of the login throttle rules (SEC-02).
import { describe, expect, test } from 'bun:test'
import { LoginThrottle, loginThrottleOptionsFromEnv } from './login-throttle.js'

function throttleWith(
  hits: Record<string, number>,
  options?: { maxAttempts?: number; windowMs?: number },
): { throttle: LoginThrottle; advance: (ms: number) => void } {
  let nowMs = 1_000_000
  const throttle = new LoginThrottle({
    now: () => nowMs,
    ...options,
  })
  for (const [key, times] of Object.entries(hits)) {
    for (let i = 0; i < times; i += 1) {
      throttle.recordFailure(key)
    }
  }
  return {
    throttle,
    advance: (ms: number) => {
      nowMs += ms
    },
  }
}

describe('loginThrottleOptionsFromEnv', () => {
  test('sin env usa los valores por defecto', () => {
    const options = loginThrottleOptionsFromEnv({})
    expect(options.maxAttempts).toBe(5)
    expect(options.windowMs).toBe(15 * 60 * 1000)
  })

  test('valores invalidos caen al por defecto', () => {
    expect(
      loginThrottleOptionsFromEnv({ LOGIN_MAX_ATTEMPTS: 'cero' }).maxAttempts,
    ).toBe(5)
    expect(
      loginThrottleOptionsFromEnv({ LOGIN_WINDOW_MINUTES: '-3' }).windowMs,
    ).toBe(15 * 60 * 1000)
  })

  test('valores validos se respetan', () => {
    const options = loginThrottleOptionsFromEnv({
      LOGIN_MAX_ATTEMPTS: '3',
      LOGIN_WINDOW_MINUTES: '2',
    })
    expect(options.maxAttempts).toBe(3)
    expect(options.windowMs).toBe(2 * 60 * 1000)
  })
})

describe('LoginThrottle', () => {
  test('permite hasta el tope de intentos y bloquea el siguiente', () => {
    const { throttle } = throttleWith({ 'user:1.1.1.1|ana': 4 })
    expect(throttle.blockedFor('user:1.1.1.1|ana')).toBe(0)
    throttle.recordFailure('user:1.1.1.1|ana')
    expect(throttle.blockedFor('user:1.1.1.1|ana')).toBeGreaterThan(0)
  })

  test('el bloqueo caduca cuando el intento mas viejo sale de la ventana', () => {
    const windowMs = 60_000
    const { throttle, advance } = throttleWith(
      { 'user:1.1.1.1|ana': 5 },
      { windowMs },
    )
    expect(throttle.blockedFor('user:1.1.1.1|ana')).toBeGreaterThan(0)
    advance(windowMs + 1)
    expect(throttle.blockedFor('user:1.1.1.1|ana')).toBe(0)
  })

  test('un login correcto limpia el contador de ip+usuario', () => {
    const { throttle } = throttleWith({ 'user:1.1.1.1|ana': 5 })
    throttle.reset('user:1.1.1.1|ana')
    expect(throttle.blockedFor('user:1.1.1.1|ana')).toBe(0)
  })

  test('el contador por IP usa un tope 10 veces mayor', () => {
    const { throttle } = throttleWith({ 'ip:1.1.1.1': 49 })
    expect(throttle.maxAttemptsPerIp).toBe(50)
    expect(throttle.blockedFor('ip:1.1.1.1')).toBe(0)
    throttle.recordFailure('ip:1.1.1.1')
    expect(throttle.blockedFor('ip:1.1.1.1')).toBeGreaterThan(0)
  })

  test('los intentos viejos no cuentan contra el tope', () => {
    const windowMs = 60_000
    const { throttle, advance } = throttleWith(
      { 'user:1.1.1.1|ana': 5 },
      { windowMs },
    )
    advance(Math.floor(windowMs / 2))
    throttle.recordFailure('user:1.1.1.1|ana')
    advance(Math.floor(windowMs / 2) + 1)
    expect(throttle.blockedFor('user:1.1.1.1|ana')).toBe(0)
  })
})
