// Auth ports — the narrow surface the auth service needs from the database.
//
// Rule of the codebase: services depend on ports (interfaces), adapters
// depend on Prisma. That keeps every business rule testable without a
// database and keeps the SQL/Prisma details in one file per aggregate.

/** DI token of the auth port. */
export const AUTH_STORE = 'AUTH_STORE'

export interface AuthUserRecord {
  id: string
  facilityId: string
  facilityCode: string
  username: string
  fullName: string
  status: string
  passwordHash: string | null
  validUntil: Date | null
}

export interface SessionRecord {
  id: string
  tokenHash: string
  appUserId: string
  facilityId: string
  expiresAt: Date
  revokedAt: Date | null
}

export interface SessionWithUser extends SessionRecord {
  user: AuthUserRecord
  roleCodes: string[]
  permissionCodes: string[]
}

export interface NewSession {
  tokenHash: string
  appUserId: string
  facilityId: string
  expiresAt: Date
  userAgent?: string | undefined
  ipAddress?: string | undefined
}

export interface AuthStore {
  findUsersByUsername(
    username: string,
    facilityCode?: string,
  ): Promise<AuthUserRecord[]>
  findUserById(userId: string): Promise<AuthUserRecord | null>
  /** Marks the user; deactivation is the only status change the API makes. */
  setUserStatus(userId: string, status: string): Promise<void>
  /** Revokes every non-revoked session of the user; returns how many. */
  revokeActiveSessionsForUser(userId: string): Promise<number>
  findSessionByTokenHash(tokenHash: string): Promise<SessionWithUser | null>
  createSession(input: NewSession): Promise<SessionRecord>
  revokeSession(sessionId: string): Promise<void>
  touchSession(sessionId: string, at: Date): Promise<void>
  markLogin(userId: string, at: Date): Promise<void>
  roleCodesForUser(userId: string): Promise<string[]>
  permissionCodesForUser(userId: string): Promise<string[]>
  domainCodesForUser(userId: string): Promise<string[]>
}
