// Auth service — session lifecycle and identity rules (ADR-0021).
//
// The token is opaque and random; only its SHA-256 lives in the database.
// Revocation is immediate (the row is marked revoked, never deleted).
// Passwords are bcrypt hashes stored in core.app_user.password_hash.

import { createHash, randomBytes } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'
import { compare } from 'bcryptjs'
import { ApiError } from '../common/api-error.js'
import { AUTH_STORE, type AuthStore } from './auth.store.js'
import { LoginThrottle, loginThrottleOptionsFromEnv } from './login-throttle.js'

export interface LoginInput {
  username: string
  password: string
  facilityCode?: string
}

export interface SessionUser {
  sessionId: string
  userId: string
  facilityId: string
  facilityCode: string
  username: string
  fullName: string
  roles: string[]
  permissions: string[]
}

export interface LoginResult {
  token: string
  expiresAt: Date
  user: SessionUser
}

export interface Profile {
  id: string
  username: string
  fullName: string
  facilityId: string
  facilityCode: string
  roles: string[]
  permissions: string[]
  domains: string[]
}

const DEFAULT_TTL_HOURS = 8

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function sessionTtlMs(): number {
  const raw = process.env.SESSION_TTL_HOURS
  const hours = raw ? Number(raw) : DEFAULT_TTL_HOURS
  if (!Number.isFinite(hours) || hours <= 0) {
    return DEFAULT_TTL_HOURS * 60 * 60 * 1000
  }
  return hours * 60 * 60 * 1000
}

@Injectable()
export class AuthService {
  // In Nest the throttle comes from AuthModule (one per API process, seeded
  // from env). The default here only serves direct construction in the
  // offline specs; the rules live in LoginThrottle, testable without a
  // clock or a store.
  constructor(
    @Inject(AUTH_STORE) private readonly store: AuthStore,
    private readonly throttle: LoginThrottle = new LoginThrottle(
      loginThrottleOptionsFromEnv(),
    ),
  ) {}

  async login(
    input: LoginInput,
    context: {
      userAgent?: string | undefined
      ipAddress?: string | undefined
    } = {},
  ): Promise<LoginResult> {
    const ipKey = `ip:${context.ipAddress ?? 'unknown'}`
    const userKey = `user:${context.ipAddress ?? 'unknown'}|${input.username.toLowerCase()}`
    const blockedMs = Math.max(
      this.throttle.blockedFor(ipKey),
      this.throttle.blockedFor(userKey),
    )
    if (blockedMs > 0) {
      throw ApiError.rateLimited(
        `Demasiados intentos fallidos; reintenta en ${Math.ceil(blockedMs / 1000)} segundos.`,
        { retryAfterSec: Math.ceil(blockedMs / 1000) },
      )
    }

    const users = await this.store.findUsersByUsername(
      input.username,
      input.facilityCode,
    )
    const [user] = users
    if (!user) {
      // Same message as a wrong password: no user enumeration.
      this.throttle.recordFailure(ipKey)
      this.throttle.recordFailure(userKey)
      throw ApiError.unauthenticated('Usuario o contraseña incorrectos.')
    }
    if (users.length > 1) {
      throw ApiError.validation(
        'El usuario existe en más de una instalación: indica la instalación (facilityCode).',
        { field: 'facilityCode' },
      )
    }
    if (user.status !== 'activo') {
      this.throttle.recordFailure(ipKey)
      this.throttle.recordFailure(userKey)
      throw ApiError.forbidden('El usuario está inactivo.')
    }
    if (user.validUntil !== null && user.validUntil <= new Date()) {
      this.throttle.recordFailure(ipKey)
      this.throttle.recordFailure(userKey)
      throw ApiError.forbidden('El usuario está fuera de vigencia.')
    }
    if (!user.passwordHash) {
      this.throttle.recordFailure(ipKey)
      this.throttle.recordFailure(userKey)
      throw ApiError.unauthenticated(
        'El usuario todavía no tiene contraseña asignada.',
      )
    }
    const valid = await compare(input.password, user.passwordHash)
    if (!valid) {
      this.throttle.recordFailure(ipKey)
      this.throttle.recordFailure(userKey)
      throw ApiError.unauthenticated('Usuario o contraseña incorrectos.')
    }

    const token = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + sessionTtlMs())
    const session = await this.store.createSession({
      tokenHash: hashToken(token),
      appUserId: user.id,
      facilityId: user.facilityId,
      expiresAt,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
    })
    await this.store.markLogin(user.id, new Date())
    // A correct login re-arms only ip+user: the per-IP counter decays by
    // window alone so a hitlist cannot be extended by succeeding.
    this.throttle.reset(userKey)

    return {
      token,
      expiresAt,
      user: {
        sessionId: session.id,
        userId: user.id,
        facilityId: user.facilityId,
        facilityCode: user.facilityCode,
        username: user.username,
        fullName: user.fullName,
        roles: await this.store.roleCodesForUser(user.id),
        permissions: await this.store.permissionCodesForUser(user.id),
      },
    }
  }

  async logout(sessionId: string): Promise<void> {
    await this.store.revokeSession(sessionId)
  }

  /**
   * Deactivates the user and revokes their active sessions in the same
   * operation (SEC-03): a deactivated account must not keep live sessions.
   * The guard also revalidates status on every request, so even without
   * this revocation the sessions stop working on the next call.
   */
  async deactivate(userId: string): Promise<number> {
    await this.store.setUserStatus(userId, 'inactivo')
    return this.store.revokeActiveSessionsForUser(userId)
  }

  async profile(userId: string): Promise<Profile> {
    const user = await this.store.findUserById(userId)
    if (!user) {
      throw ApiError.notFound('El usuario ya no existe.')
    }
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      facilityId: user.facilityId,
      facilityCode: user.facilityCode,
      roles: await this.store.roleCodesForUser(user.id),
      permissions: await this.store.permissionCodesForUser(user.id),
      domains: await this.store.domainCodesForUser(user.id),
    }
  }
}
