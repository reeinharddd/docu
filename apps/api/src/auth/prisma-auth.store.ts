// Prisma adapter for the auth port. All Prisma details of identity live here:
// the service above never sees a Prisma object.
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import type {
  AuthStore,
  AuthUserRecord,
  NewSession,
  SessionRecord,
  SessionWithUser,
} from './auth.store.js'

function toUser(row: {
  id: string
  facilityId: string
  username: string
  fullName: string
  status: string
  passwordHash: string | null
  validUntil: Date | null
  facility: { code: string }
}): AuthUserRecord {
  return {
    id: row.id,
    facilityId: row.facilityId,
    facilityCode: row.facility.code,
    username: row.username,
    fullName: row.fullName,
    status: row.status,
    passwordHash: row.passwordHash,
    validUntil: row.validUntil,
  }
}

const userInclude = { facility: true } as const

@Injectable()
export class PrismaAuthStore implements AuthStore {
  constructor(private readonly prisma: PrismaService) {}

  async findUsersByUsername(
    username: string,
    facilityCode?: string,
  ): Promise<AuthUserRecord[]> {
    const rows = await this.prisma.appUser.findMany({
      where: {
        username,
        ...(facilityCode ? { facility: { code: facilityCode } } : {}),
      },
      include: userInclude,
    })
    return rows.map(toUser)
  }

  async findUserById(userId: string): Promise<AuthUserRecord | null> {
    const row = await this.prisma.appUser.findUnique({
      where: { id: userId },
      include: userInclude,
    })
    return row ? toUser(row) : null
  }

  async setUserStatus(userId: string, status: string): Promise<void> {
    await this.prisma.appUser.update({
      where: { id: userId },
      data: { status },
    })
  }

  async revokeActiveSessionsForUser(userId: string): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: { appUserId: userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    return result.count
  }

  async findSessionByTokenHash(
    tokenHash: string,
  ): Promise<SessionWithUser | null> {
    const row = await this.prisma.session.findUnique({
      where: { tokenHash },
      include: {
        appUser: {
          include: {
            ...userInclude,
            roles: {
              include: {
                role: {
                  include: {
                    rolePermissions: { include: { permission: true } },
                  },
                },
              },
            },
          },
        },
      },
    })
    if (!row) {
      return null
    }
    const roles = row.appUser.roles.map((ur) => ur.role)
    const permissionCodes = new Set<string>()
    for (const role of roles) {
      for (const rp of role.rolePermissions) {
        permissionCodes.add(rp.permission.code)
      }
    }
    return {
      id: row.id,
      tokenHash: row.tokenHash,
      appUserId: row.appUserId,
      facilityId: row.facilityId,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
      user: toUser(row.appUser),
      roleCodes: roles.map((role) => role.code),
      permissionCodes: [...permissionCodes].sort(),
    }
  }

  async createSession(input: NewSession): Promise<SessionRecord> {
    const row = await this.prisma.session.create({
      data: {
        tokenHash: input.tokenHash,
        appUserId: input.appUserId,
        facilityId: input.facilityId,
        expiresAt: input.expiresAt,
        issuedAt: new Date(),
        lastSeenAt: new Date(),
        userAgent: input.userAgent ?? null,
        ipAddress: input.ipAddress ?? null,
      },
    })
    return {
      id: row.id,
      tokenHash: row.tokenHash,
      appUserId: row.appUserId,
      facilityId: row.facilityId,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
    }
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  async touchSession(sessionId: string, at: Date): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: sessionId },
      data: { lastSeenAt: at },
    })
  }

  async markLogin(userId: string, at: Date): Promise<void> {
    await this.prisma.appUser.update({
      where: { id: userId },
      data: { lastLoginAt: at },
    })
  }

  async roleCodesForUser(userId: string): Promise<string[]> {
    const rows = await this.prisma.userRole.findMany({
      where: { appUserId: userId },
      include: { role: true },
    })
    return rows.map((ur) => ur.role.code).sort()
  }

  async permissionCodesForUser(userId: string): Promise<string[]> {
    const rows = await this.prisma.userRole.findMany({
      where: { appUserId: userId },
      include: {
        role: {
          include: { rolePermissions: { include: { permission: true } } },
        },
      },
    })
    const codes = new Set<string>()
    for (const ur of rows) {
      for (const rp of ur.role.rolePermissions) {
        codes.add(rp.permission.code)
      }
    }
    return [...codes].sort()
  }

  async domainCodesForUser(userId: string): Promise<string[]> {
    const rows = await this.prisma.userDomain.findMany({
      where: { appUserId: userId },
      include: { domain: true },
    })
    return rows.map((ud) => ud.domain.code).sort()
  }
}
