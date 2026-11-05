import { inject } from '@angular/core'
import { type CanActivateFn, Router } from '@angular/router'
import { AuthService } from '../../services/auth/auth.service'
import type { Permission } from '../../types/permissions'

/**
 * Permission gate: session without the required permission -> /forbidden.
 * Permissions are keys, not UI decisions; the server (RF-06) decides for
 * real and this guard only avoids rendering what the user cannot see.
 */
export const requiresPermission =
  (permission: Permission): CanActivateFn =>
  () => {
    const auth = inject(AuthService)
    const router = inject(Router)
    if (!auth.authenticated()) return router.createUrlTree(['/login'])
    return auth.can(permission) ? true : router.createUrlTree(['/forbidden'])
  }
