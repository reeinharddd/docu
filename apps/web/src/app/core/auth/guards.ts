import { inject } from '@angular/core'
import { type CanActivateFn, Router } from '@angular/router'
import { AuthService } from './auth.service'
import type { Permission } from './permissions'

/**
 * Protected routes: no session -> /login. Session without the required
 * permission -> /forbidden. The final verdict always comes from the server
 * (RF-06); these guards only avoid rendering what the user cannot see.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService)
  const router = inject(Router)
  return auth.authenticated() ? true : router.createUrlTree(['/login'])
}

export const requiresPermission =
  (permission: Permission): CanActivateFn =>
  () => {
    const auth = inject(AuthService)
    const router = inject(Router)
    if (!auth.authenticated()) return router.createUrlTree(['/login'])
    return auth.can(permission) ? true : router.createUrlTree(['/forbidden'])
  }
