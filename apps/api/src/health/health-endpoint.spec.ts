// Prueba de endpoint de GET /health (BRIEF #45): una app Nest mínima con el
// controller real responde a través de HTTP. Se fuerza la base y redis a
// puertos inalcanzables para que la prueba sea determinista sin infraestructura:
// con los dos segmentos caídos la puerta responde 503. La rama 200 con todo
// arriba la cubre `scripts/smoke-api.sh` en CI.
import { afterEach, describe, expect, it } from 'bun:test'
import { createTestApp, type TestApp } from '../../test/helpers/http-testing.js'
import { HealthController } from './health.controller.js'

const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL
const ORIGINAL_REDIS_URL = process.env.REDIS_URL

describe('GET /health (endpoint)', () => {
  let testApp: TestApp | undefined

  afterEach(async () => {
    await testApp?.app.close()
    process.env.DATABASE_URL = ORIGINAL_DATABASE_URL
    process.env.REDIS_URL = ORIGINAL_REDIS_URL
  })

  it('responde 503 cuando la base y redis no responden', async () => {
    process.env.DATABASE_URL = 'postgresql://nobody@127.0.0.1:1/none'
    process.env.REDIS_URL = 'redis://127.0.0.1:1'

    testApp = await createTestApp({ controllers: [HealthController] })
    const res = await testApp.http.get('/health')

    expect(res.status).toBe(503)
    expect(res.body.status).toBe('degraded')
  })

  it('conserva el diagnostico: el 503 dice que segmento cayo', async () => {
    // El sobre generico de error esconde la causa: la puerta tiene que decir
    // que la base y redis estan caidos (drill de orquestacion, 2026-11-07).
    process.env.DATABASE_URL = 'postgresql://nobody@127.0.0.1:1/none'
    process.env.REDIS_URL = 'redis://127.0.0.1:1'

    testApp = await createTestApp({ controllers: [HealthController] })
    const res = await testApp.http.get('/health')

    expect(res.status).toBe(503)
    expect(res.body.status).toBe('degraded')
    expect(res.body.postgres).toBe('down')
    expect(res.body.redis).toBe('down')
    expect(res.body.worker).toEqual({ alive: false, queues: {} })
    // No es el sobre de error de negocio: no debe llevar `code`/`message`.
    expect(res.body.code).toBeUndefined()
  })
})
