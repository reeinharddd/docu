// Permission guard — RBAC from the data of ADR-0009: roles carry permissions,
// permissions are checked per route, never assumed.
//
// Usage:
//   @RequirePermission('confirm')
//   @UseGuards(SessionGuard, PermissionsGuard)
//   @Post(':id/confirm') ...
//
// Several permissions mean ALL of them: an endpoint that performs two acts
// (e.g. POST /v1/files registers `create` AND `submit`) demands both; the
// server never grants a route for half the acts it performs.
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ApiError } from '../common/api-error.js'
import { type SessionRequest, sessionUserOf } from './session.guard.js'

export const REQUIRED_PERMISSION = 'docu:required-permission'

export const RequirePermission = (
  ...permissions: [string, ...string[]]
): MethodDecorator & ClassDecorator =>
  SetMetadata(REQUIRED_PERMISSION, permissions)

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSION,
      [context.getHandler(), context.getClass()],
    )
    if (!required) {
      return true
    }
    const request = context.switchToHttp().getRequest<SessionRequest>()
    const user = sessionUserOf(request)
    const missing = required.filter((p) => !user.permissions.includes(p))
    if (missing.length > 0) {
      throw ApiError.forbidden(
        `Tu rol no tiene el permiso «${missing[0] ?? required[0]}».`,
      )
    }
    return true
  }
}
