// Offline unit tests of the session guard (ADR-0021 + SEC-03): the guard
// authenticates the session and revalidates the user's status and vigencia
// on every request.
import { describe, expect, test } from 'bun:test'
import { ApiError } from '../common/api-error.js'
import type {
  AuthStore,
  AuthUserRecord,
  SessionRecord,
  SessionWithUser,
} from './auth.store.js'
import { SessionGuard } from './session.guard.js'

function user(overrides: Partial<AuthUserRecord> = {}): AuthUserRecord {
  return {
    id: 'user-1',
    facilityId: 'fac-1',
    facilityCode: 'C1',
    username: 'andres',
    fullName: 'Andrés',
    status: 'activo',
    passwordHash: 'hash',
    validUntil: null,
    ...overrides,
  }
}

function sessionWith(
  store: { user: AuthUserRecord },
  overrides: Partial<SessionRecord> = {},
): SessionWithUser {
  const now = new Date()
  return {
    id: 'session-1',
    tokenHash: 'abc',
    appUserId: store.user.id,
    facilityId: store.user.facilityId,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    revokedAt: null,
    user: store.user,
    roleCodes: ['admin'],
    permissionCodes: ['read'],
    ...overrides,
  }
}

function fakeStore(session: SessionWithUser | null): AuthStore {
  return {
    findUsersByUsername: async () => [],
    findUserById: async () => null,
    setUserStatus: async () => {},
    revokeActiveSessionsForUser: async () => 0,
    findSessionByTokenHash: async () => session,
    createSession: async () => {
      throw new Error('no sessions are created here')
    },
    revokeSession: async () => {},
    touchSession: async () => {},
    markLogin: async () => {},
    roleCodesForUser: async () => ['admin'],
    permissionCodesForUser: async () => ['read'],
    domainCodesForUser: async () => ['materiales'],
  }
}

function guardFor(session: SessionWithUser | null): SessionGuard {
  return new SessionGuard(fakeStore(session))
}

function requestWithToken(token: string): Record<string, unknown> {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: { authorization: `Bearer ${token}` },
      }),
    }),
  }
}

const executionContextOf = requestWithToken('token-1')

async function canActivate(guard: SessionGuard): Promise<boolean> {
  return guard.canActivate(
    executionContextOf as unknown as Parameters<SessionGuard['canActivate']>[0],
  )
}

describe('session guard', () => {
  test('sin cabecera de autorización no hay sesión', async () => {
    const guard = new SessionGuard(fakeStore(null))
    const empty = {
      switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
    }
    expect(
      guard.canActivate(
        empty as unknown as Parameters<SessionGuard['canActivate']>[0],
      ),
    ).rejects.toThrow(ApiError)
  })

  test('una sesión viva autentica y adjunta el usuario', async () => {
    const guard = guardFor(sessionWith({ user: user() }))
    expect(await canActivate(guard)).toBe(true)
  })

  test('una sesión revocada no autentica', async () => {
    const guard = guardFor(
      sessionWith({ user: user() }, { revokedAt: new Date() }),
    )
    expect(canActivate(guard)).rejects.toThrow('vencida o fue revocada')
  })

  test('una sesión vencida no autentica', async () => {
    const guard = guardFor(
      sessionWith({ user: user() }, { expiresAt: new Date(Date.now() - 1000) }),
    )
    expect(canActivate(guard)).rejects.toThrow('vencida o fue revocada')
  })

  test('usuario inactivo con sesión viva: prohibido, no autenticado (SEC-03)', async () => {
    const guard = guardFor(sessionWith({ user: user({ status: 'inactivo' }) }))
    const error = await canActivate(guard).catch((e: ApiError) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe('FORBIDDEN')
  })

  test('usuario fuera de vigencia con sesión viva: prohibido (SEC-03)', async () => {
    const guard = guardFor(
      sessionWith({
        user: user({ validUntil: new Date(Date.now() - 1000) }),
      }),
    )
    const error = await canActivate(guard).catch((e: ApiError) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe('FORBIDDEN')
  })
})
