import {
  HttpErrorResponse,
  type HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http'
import { InjectionToken, inject, type Provider } from '@angular/core'
import { delay, mergeMap, of, throwError, timer } from 'rxjs'
import { API_BASE_URL } from '../../config/api-url'
import { AuthService } from '../../services/auth/auth.service'

/**
 * DEMO ONLY — dies when the API (#12) and the corpus (#61) land.
 *
 * Serves each feature's local fixtures behind the real HTTP contract, so
 * screens read through ApiClient exactly as they will against the backend.
 * Swapping fixture -> API means removing this interceptor: no screen and no
 * spec changes (BRIEF-11 §8.1, criterion 4). Specs never use it: they drive
 * HttpTestingController directly.
 */

export interface DemoRequest {
  /** Regex groups of the matched path. */
  match: RegExpMatchArray
  query: URLSearchParams
  body: unknown
  /** Display name of the demo session user, for "who confirmed". */
  user: string
}

export interface DemoReply {
  status?: number
  body: unknown
}

export interface DemoRoute {
  method: 'GET' | 'POST'
  /** Matched against the path without the API base and query string. */
  path: RegExp
  /** null = not mine (e.g. another filter on the same path): try the next. */
  respond: (req: DemoRequest) => DemoReply | null
}

export const DEMO_ROUTES = new InjectionToken<DemoRoute[]>('DEMO_ROUTES', {
  factory: () => [],
})

/** Simulated network latency so the loading state is visible. */
export const DEMO_LATENCY_MS = new InjectionToken<number>('DEMO_LATENCY_MS', {
  factory: () => 450,
})

/**
 * Registers the demo routes. Takes a factory so every injector (every test,
 * every app boot) starts from fresh fixture state.
 */
export function provideDemoBackend(routes: () => DemoRoute[]): Provider[] {
  return [{ provide: DEMO_ROUTES, useFactory: routes }]
}

export const demoBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const routes = inject(DEMO_ROUTES)
  const base = inject(API_BASE_URL)
  const latency = inject(DEMO_LATENCY_MS)
  const session = inject(AuthService).session()

  const url = new URL(req.urlWithParams, 'http://demo.local')
  const path = url.pathname.startsWith(`${base}/`)
    ? url.pathname.slice(base.length)
    : url.pathname

  for (const route of routes) {
    if (route.method !== req.method) continue
    const match = path.match(route.path)
    if (!match) continue
    const reply = route.respond({
      match,
      query: url.searchParams,
      body: req.body,
      user: displayName(session?.user),
    })
    if (reply === null) continue
    const status = reply.status ?? 200
    if (status >= 400) {
      return timer(latency).pipe(
        mergeMap(() =>
          throwError(
            () =>
              new HttpErrorResponse({
                status,
                error: reply.body,
                url: req.url,
              }),
          ),
        ),
      )
    }
    return of(new HttpResponse({ status, body: reply.body })).pipe(
      delay(latency),
    )
  }
  return next(req)
}

function displayName(user: string | undefined): string {
  if (!user) return 'Usuario demo'
  return user.charAt(0).toUpperCase() + user.slice(1)
}
