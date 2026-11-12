// Session guard — ADR-0021: opaque token, stored as SHA-256 in
// platform.session, immediate revocation.
//
// The guard authenticates (who is asking) and attaches the user with their
// roles and permissions. Permission checks are the route's job
// (`@RequirePermission('read')`), never a blanket allow here.
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common'
import type { Request } from 'express'
import { ApiError } from '../common/api-error.js'
import { hashToken, type SessionUser } from './auth.service.js'
import { AUTH_STORE, type AuthStore } from './auth.store.js'

export interface SessionRequest extends Request {
  sessionUser?: SessionUser
}

const BEARER_PREFIX = 'Bearer '

@Injectable()
export class SessionGuard implements CanActivate {
  // The port, not the adapter: the guard is used by other modules, and the
  // port token is what AuthModule exports.
  constructor(@Inject(AUTH_STORE) private readonly store: AuthStore) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<SessionRequest>()
    const header = request.headers.authorization ?? ''
    const token = header.startsWith(BEARER_PREFIX)
      ? header.slice(BEARER_PREFIX.length)
      : ''
    if (token === '') {
      throw ApiError.unauthenticated('Falta el token de sesión.')
    }

    const session = await this.store.findSessionByTokenHash(hashToken(token))
    if (
      !session ||
      session.revokedAt !== null ||
      session.expiresAt <= new Date()
    ) {
      throw ApiError.unauthenticated(
        'La sesión no existe, está vencida o fue revocada.',
      )
    }
    // The session row joins the user on every request, so this check is
    // always fresh (SEC-03): deactivating a user or ending their vigencia
    // stops their live sessions on the very next request, without waiting
    // for the session TTL.
    if (session.user.status !== 'activo') {
      throw ApiError.forbidden('El usuario está inactivo.')
    }
    if (
      session.user.validUntil !== null &&
      session.user.validUntil <= new Date()
    ) {
      throw ApiError.forbidden('El usuario está fuera de vigencia.')
    }

    request.sessionUser = {
      sessionId: session.id,
      userId: session.user.id,
      facilityId: session.facilityId,
      facilityCode: session.user.facilityCode,
      username: session.user.username,
      fullName: session.user.fullName,
      roles: session.roleCodes,
      permissions: session.permissionCodes,
    }
    await this.store.touchSession(session.id, new Date())
    return true
  }
}

// Reads the authenticated user or fails: every route behind the guard can
// trust sessionUser, but the type stays honest about the optional shape.
export function sessionUserOf(request: SessionRequest): SessionUser {
  const user = request.sessionUser
  if (!user) {
    throw ApiError.unauthenticated()
  }
  return user
}
