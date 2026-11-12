// Permission guard — RBAC from the data of ADR-0009: roles carry permissions,
// permissions are checked per route, never assumed.
//
// Usage:
//   @RequirePermission('confirm')
//   @UseGuards(SessionGuard, PermissionsGuard)
//   @Post(':id/confirm') ...
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
  permission: string,
): MethodDecorator & ClassDecorator =>
  SetMetadata(REQUIRED_PERMISSION, permission)

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string>(
      REQUIRED_PERMISSION,
      [context.getHandler(), context.getClass()],
    )
    if (!required) {
      return true
    }
    const request = context.switchToHttp().getRequest<SessionRequest>()
    const user = sessionUserOf(request)
    if (!user.permissions.includes(required)) {
      throw ApiError.forbidden(`Tu rol no tiene el permiso «${required}».`)
    }
    return true
  }
}
