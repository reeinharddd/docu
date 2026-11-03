import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { catchError, throwError } from 'rxjs'
import { AuthService } from '../auth/auth.service'
import { API_BASE_URL } from '../config/api-url'

/**
 * Single place for cross-cutting HTTP behavior. Screens never see raw URLs,
 * tokens or error shapes.
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

  /** Normalizes failures so the UI can render one actionable message. */
  (req, next) =>
    next(req).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          console.error(`[api] ${req.method} ${req.url} -> ${error.status}`)
        }
        return throwError(() => error)
      }),
    ),
]
