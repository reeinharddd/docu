import type { Routes } from '@angular/router'
import { authGuard, requiresPermission } from './core/auth/guards'
import { ROUTE_PERMISSIONS } from './core/auth/permissions'

/**
 * Route map of the case. Every protected route pairs with a permission key
 * (ROUTE_PERMISSIONS); titles are UI-facing and stay in Spanish (RNF-01).
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'capture' },
  {
    path: 'capture',
    title: 'Captura · DOCU',
    canActivate: [authGuard, requiresPermission(ROUTE_PERMISSIONS.capture)],
    loadComponent: () =>
      import('./features/capture/capture-page').then((m) => m.CapturePage),
  },
  {
    path: 'inbox',
    title: 'Bandeja · DOCU',
    canActivate: [authGuard, requiresPermission(ROUTE_PERMISSIONS.inbox)],
    loadComponent: () =>
      import('./features/inbox/inbox-page').then((m) => m.InboxPage),
  },
  {
    path: 'schedule',
    title: 'Programa · DOCU',
    canActivate: [authGuard, requiresPermission(ROUTE_PERMISSIONS.schedule)],
    loadComponent: () =>
      import('./features/schedule/schedule-page').then((m) => m.SchedulePage),
  },
  {
    path: 'search',
    title: 'Búsqueda · DOCU',
    canActivate: [authGuard, requiresPermission(ROUTE_PERMISSIONS.search)],
    loadComponent: () =>
      import('./features/search/search-page').then((m) => m.SearchPage),
  },
  {
    path: 'login',
    title: 'Acceso · DOCU',
    loadComponent: () =>
      import('./features/login/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'forbidden',
    title: 'Sin permiso · DOCU',
    loadComponent: () =>
      import('./features/forbidden/forbidden-page').then(
        (m) => m.ForbiddenPage,
      ),
  },
  { path: '**', redirectTo: 'capture' },
]
