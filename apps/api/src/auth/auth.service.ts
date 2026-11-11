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
  constructor(@Inject(AUTH_STORE) private readonly store: AuthStore) {}

  async login(
    input: LoginInput,
    context: {
      userAgent?: string | undefined
      ipAddress?: string | undefined
    } = {},
  ): Promise<LoginResult> {
    const users = await this.store.findUsersByUsername(
      input.username,
      input.facilityCode,
    )
    const [user] = users
    if (!user) {
      // Same message as a wrong password: no user enumeration.
      throw ApiError.unauthenticated('Usuario o contraseña incorrectos.')
    }
    if (users.length > 1) {
      throw ApiError.validation(
        'El usuario existe en más de una instalación: indica la instalación (facilityCode).',
        { field: 'facilityCode' },
      )
    }
    if (user.status !== 'activo') {
      throw ApiError.forbidden('El usuario está inactivo.')
    }
    if (user.validUntil !== null && user.validUntil <= new Date()) {
      throw ApiError.forbidden('El usuario está fuera de vigencia.')
    }
    if (!user.passwordHash) {
      throw ApiError.unauthenticated(
        'El usuario todavía no tiene contraseña asignada.',
      )
    }
    const valid = await compare(input.password, user.passwordHash)
    if (!valid) {
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
