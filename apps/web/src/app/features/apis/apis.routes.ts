import type { Routes } from '@angular/router'
import { requiresPermission } from '../../core/middleware/permissions/guard'
import { ROUTE_PERMISSIONS } from '../../core/types/permissions'
import { ApisView } from './views/apis-view'

/**
 * Routes of the apis feature (DEMO mock-up for the course report: the
 * screen is designed, its backend is not built yet).
 */
export const apisRoutes: Routes = [
  {
    path: '',
    title: 'APIs · DOCU',
    canActivate: [requiresPermission(ROUTE_PERMISSIONS.apis)],
    component: ApisView,
  },
]
