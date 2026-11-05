import { inject } from '@angular/core'
import { type CanActivateFn, Router } from '@angular/router'
import { AuthService } from '../../services/auth/auth.service'

/**
 * Session gate: no session -> /login. The permission gate lives in
 * middleware/permissions. The final verdict always comes from the server
 * (RF-06); these guards only avoid rendering what the user cannot see.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService)
  const router = inject(Router)
  return auth.authenticated() ? true : router.createUrlTree(['/login'])
}
