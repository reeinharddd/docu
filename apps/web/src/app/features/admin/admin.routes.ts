import type { Routes } from '@angular/router'
import { requiresPermission } from '../../core/middleware/permissions/guard'
import { ROUTE_PERMISSIONS } from '../../core/types/permissions'
import { AdminView } from './views/admin-view'

/**
 * Routes of the admin feature (DEMO mock-up for the course report: the
 * screen is designed, its backend is not built yet).
 */
export const adminRoutes: Routes = [
  {
    path: '',
    title: 'Administración · DOCU',
    canActivate: [requiresPermission(ROUTE_PERMISSIONS.admin)],
    component: AdminView,
  },
]
