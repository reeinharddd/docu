import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { catchError, throwError } from 'rxjs'
import { API_BASE_URL } from '../../config/api-url'
import { AuthService } from '../../services/auth/auth.service'

/**
 * Single place for cross-cutting HTTP behavior. Screens never see raw URLs,
 * tokens or error shapes.
 *
 * Coordination flows (the contract lives in
 * docs/ingenieria/ALCANCE-SOLUCION.md §2.1):
 * - 401 outside /auth/login: the session died -> clear it and go to /login.
 * - 401 from /auth/login itself: bad credentials, stay on the page.
 * - 403: not allowed to see it -> /forbidden.
 */
export const apiInterceptors: HttpInterceptorFn[] = [
  /** Prepends the central API base to relative paths. */
  (req, next) => {
    if (req.url.startsWith('/')) {
      return next(req.clone({ url: `${inject(API_BASE_URL)}${req.url}` }))
    }
    return next(req)
  },

  /** Attaches the session token when the backend provided one (#12). */
  (req, next) => {
    const token = inject(AuthService).session()?.token
    if (!token) return next(req)
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
  },

  /** Normalizes failures and runs the 401/403 coordination flows. */
  (req, next) => {
    const router = inject(Router)
    const auth = inject(AuthService)
    return next(req).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          console.error(`[api] ${req.method} ${req.url} -> ${error.status}`)
          const isLogin = req.url.includes('/auth/login')
          if (error.status === 401 && !isLogin) {
            auth.signOut()
            void router.navigate(['/login'], {
              queryParams: { return: router.url },
            })
          } else if (error.status === 403) {
            void router.navigate(['/forbidden'])
          }
        }
        return throwError(() => error)
      }),
    )
  },
]
