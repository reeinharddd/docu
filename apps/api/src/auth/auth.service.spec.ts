// Offline unit tests of the auth rules (ADR-0021): opaque token, SHA-256 at
// rest, immediate revocation, no user enumeration.
import { describe, expect, test } from 'bun:test'
import { hash as bcryptHash } from 'bcryptjs'
import { ApiError } from '../common/api-error.js'
import { AuthService, hashToken } from './auth.service.js'
import type {
  AuthStore,
  AuthUserRecord,
  NewSession,
  SessionRecord,
  SessionWithUser,
} from './auth.store.js'

interface FakeState {
  users: AuthUserRecord[]
  sessions: SessionRecord[]
  revoked: string[]
  touched: string[]
}

function user(overrides: Partial<AuthUserRecord> = {}): AuthUserRecord {
  return {
    id: 'user-1',
    facilityId: 'fac-1',
    facilityCode: 'C1',
    username: 'andres',
    fullName: 'Andrés',
    status: 'activo',
    passwordHash: null,
    validUntil: null,
    ...overrides,
  }
}

function fakeStore(state: FakeState): AuthStore {
  return {
    findUsersByUsername: async (username, facilityCode) =>
      state.users.filter(
        (u) =>
          u.username === username &&
          (!facilityCode || u.facilityCode === facilityCode),
      ),
    findUserById: async (id) => state.users.find((u) => u.id === id) ?? null,
    findSessionByTokenHash: async (tokenHash) => {
      const session = state.sessions.find((s) => s.tokenHash === tokenHash)
      if (!session) return null
      const found = state.users.find((u) => u.id === session.appUserId)
      if (!found) return null
      const withUser: SessionWithUser = {
        ...session,
        user: found,
        roleCodes: ['admin'],
        permissionCodes: ['read', 'confirm'],
      }
      return withUser
    },
    createSession: async (input: NewSession) => {
      const session: SessionRecord = {
        id: `session-${state.sessions.length + 1}`,
        tokenHash: input.tokenHash,
        appUserId: input.appUserId,
        facilityId: input.facilityId,
        expiresAt: input.expiresAt,
        revokedAt: null,
      }
      state.sessions.push(session)
      return session
    },
    revokeSession: async (sessionId) => {
      state.revoked.push(sessionId)
      const session = state.sessions.find((s) => s.id === sessionId)
      if (session) session.revokedAt = new Date()
    },
    touchSession: async (sessionId, at) => {
      state.touched.push(sessionId)
      void at
    },
    markLogin: async () => {},
    roleCodesForUser: async () => ['admin'],
    permissionCodesForUser: async () => ['read', 'confirm'],
    domainCodesForUser: async () => ['materiales'],
  }
}

async function withPassword(plain: string): Promise<AuthUserRecord> {
  return user({ passwordHash: await bcryptHash(plain, 4) })
}

describe('auth service', () => {
  test('login returns an opaque token and never stores it in clear', async () => {
    const state: FakeState = {
      users: [await withPassword('secreto')],
      sessions: [],
      revoked: [],
      touched: [],
    }
    const service = new AuthService(fakeStore(state))
    const result = await service.login({
      username: 'andres',
      password: 'secreto',
    })

    expect(result.token.length).toBeGreaterThan(20)
    expect(state.sessions[0]?.tokenHash).toBe(hashToken(result.token))
    expect(state.sessions[0]?.tokenHash).not.toBe(result.token)
    expect(result.user.permissions).toContain('confirm')
  })

  test('wrong password is 401 with the same message as an unknown user', async () => {
    const state: FakeState = {
      users: [await withPassword('secreto')],
      sessions: [],
      revoked: [],
      touched: [],
    }
    const service = new AuthService(fakeStore(state))

    const wrong = await service
      .login({ username: 'andres', password: 'mala' })
      .catch((e: unknown) => e)
    const unknown = await service
      .login({ username: 'nadie', password: 'mala' })
      .catch((e: unknown) => e)

    expect((wrong as ApiError).code).toBe('UNAUTHENTICATED')
    expect((unknown as ApiError).code).toBe('UNAUTHENTICATED')
    expect((wrong as ApiError).message).toBe((unknown as ApiError).message)
    expect(state.sessions).toHaveLength(0)
  })

  test('inactive user is 403', async () => {
    const state: FakeState = {
      users: [await withPassword('secreto')].map((u) => ({
        ...u,
        status: 'inactivo',
      })),
      sessions: [],
      revoked: [],
      touched: [],
    }
    const service = new AuthService(fakeStore(state))
    const error = await service
      .login({ username: 'andres', password: 'secreto' })
      .catch((e: unknown) => e)
    expect((error as ApiError).code).toBe('FORBIDDEN')
  })

  test('user without password cannot log in', async () => {
    const state: FakeState = {
      users: [user()],
      sessions: [],
      revoked: [],
      touched: [],
    }
    const service = new AuthService(fakeStore(state))
    const error = await service
      .login({ username: 'andres', password: 'secreto' })
      .catch((e: unknown) => e)
    expect((error as ApiError).code).toBe('UNAUTHENTICATED')
  })

  test('same username in two installations asks for facilityCode', async () => {
    const state: FakeState = {
      users: [
        user(),
        user({ id: 'user-2', facilityId: 'fac-2', facilityCode: 'C2' }),
      ],
      sessions: [],
      revoked: [],
      touched: [],
    }
    const service = new AuthService(fakeStore(state))
    const error = await service
      .login({ username: 'andres', password: 'secreto' })
      .catch((e: unknown) => e)
    expect((error as ApiError).code).toBe('VALIDATION_ERROR')
  })

  test('logout revokes the session', async () => {
    const state: FakeState = {
      users: [await withPassword('secreto')],
      sessions: [],
      revoked: [],
      touched: [],
    }
    const service = new AuthService(fakeStore(state))
    const result = await service.login({
      username: 'andres',
      password: 'secreto',
    })
    await service.logout(result.user.sessionId)
    expect(state.revoked).toEqual([result.user.sessionId])
  })

  test('profile reports roles, permissions and domains', async () => {
    const state: FakeState = {
      users: [await withPassword('secreto')],
      sessions: [],
      revoked: [],
      touched: [],
    }
    const service = new AuthService(fakeStore(state))
    const profile = await service.profile('user-1')
    expect(profile.roles).toEqual(['admin'])
    expect(profile.permissions).toContain('read')
    expect(profile.domains).toEqual(['materiales'])
  })
})
