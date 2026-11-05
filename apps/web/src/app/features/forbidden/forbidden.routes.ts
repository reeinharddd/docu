import type { Routes } from '@angular/router'
import { ForbiddenView } from './views/forbidden-view'

/**
 * Routes of the forbidden feature. Public: the guard redirects here when
 * the session lacks a permission.
 */
export const forbiddenRoutes: Routes = [
  {
    path: '',
    title: 'Sin permiso · DOCU',
    component: ForbiddenView,
  },
]
