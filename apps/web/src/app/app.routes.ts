import type { Routes } from '@angular/router'
import { authGuard } from './core/middleware/auth/guards'

/**
 * Route map of the case. Each feature owns its own routes (URL, title and
 * permission) in its own <feature>.routes.ts; this file only mounts them.
 * Protected features pass through authGuard here; the permission check
 * lives with the feature that needs it.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'capture' },
  {
    path: 'login',
    loadChildren: () =>
      import('./features/login/login.routes').then((m) => m.loginRoutes),
  },
  {
    path: 'forbidden',
    loadChildren: () =>
      import('./features/forbidden/forbidden.routes').then(
        (m) => m.forbiddenRoutes,
      ),
  },
  {
    path: 'capture',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/capture/capture.routes').then((m) => m.captureRoutes),
  },
  {
    path: 'inbox',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/inbox/inbox.routes').then((m) => m.inboxRoutes),
  },
  {
    path: 'schedule',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/schedule/schedule.routes').then(
        (m) => m.scheduleRoutes,
      ),
  },
  {
    path: 'search',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/search/search.routes').then((m) => m.searchRoutes),
  },
  { path: '**', redirectTo: 'capture' },
]
