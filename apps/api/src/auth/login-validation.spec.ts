// Prueba de validación en el endpoint real (BRIEF #45): la puerta demuestra
// que la `ValidationPipe` global rechaza un cuerpo inválido antes de que el
// servicio se ejecute. Se monta el `AuthController` real con un `AuthService`
// falso y los guardas de sesión y permisos falsos (los endpoints de logout/me
// los referencian por decorador y Nest los resuelve al compilar). Así la
// prueba es determinista y sin base de datos.
import { describe, expect, it } from 'bun:test'
import { createTestApp } from '../../test/helpers/http-testing.js'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { PermissionsGuard } from './permissions.guard.js'
import { SessionGuard } from './session.guard.js'

const PASS_THROUGH_GUARD = { canActivate: () => true }

describe('POST /v1/auth/login (validación)', () => {
  it('rechaza un cuerpo vacío sin llamar al servicio', async () => {
    let called = false
    const fakeAuth = {
      login: async () => {
        called = true
        return {}
      },
    }

    const { app, http } = await createTestApp(
      {
        controllers: [AuthController],
        providers: [{ provide: AuthService, useValue: fakeAuth }],
      },
      (builder) =>
        builder
          .overrideGuard(SessionGuard)
          .useValue(PASS_THROUGH_GUARD)
          .overrideGuard(PermissionsGuard)
          .useValue(PASS_THROUGH_GUARD),
    )
    try {
      const res = await http.post('/v1/auth/login').send({})

      expect(res.status).toBe(400)
      expect(res.body.code).toBeString()
      expect(res.body.message).toBeString()
      expect(called).toBe(false)
    } finally {
      await app.close()
    }
  })

  it('deja pasar un cuerpo válido y devuelve el token', async () => {
    const fakeAuth = {
      login: async () => ({
        token: 'token-spec',
        expiresAt: new Date('2026-12-01T00:00:00Z'),
        user: {
          sessionId: 'session-spec',
          userId: 'user-spec',
          facilityId: 'facility-spec',
          facilityCode: 'spec',
          username: 'operador',
          fullName: 'Operador de prueba',
          roles: [],
          permissions: [],
        },
      }),
    }

    const { app, http } = await createTestApp(
      {
        controllers: [AuthController],
        providers: [{ provide: AuthService, useValue: fakeAuth }],
      },
      (builder) =>
        builder
          .overrideGuard(SessionGuard)
          .useValue(PASS_THROUGH_GUARD)
          .overrideGuard(PermissionsGuard)
          .useValue(PASS_THROUGH_GUARD),
    )
    try {
      const res = await http
        .post('/v1/auth/login')
        .send({ username: 'operador', password: 'clave' })

      expect(res.status).toBe(200)
      expect(res.body.token).toBe('token-spec')
      expect(res.body.user.username).toBe('operador')
    } finally {
      await app.close()
    }
  })
})
