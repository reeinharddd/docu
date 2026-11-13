import type { Routes } from '@angular/router'
import { requiresPermission } from '../../core/middleware/permissions/guard'
import { ROUTE_PERMISSIONS } from '../../core/types/permissions'
import { ReportsView } from './views/reports-view'

/**
 * Routes of the reports feature. The feature owns its URL, its title and
 * the permission it needs; the app only mounts it.
 */
export const reportsRoutes: Routes = [
  {
    path: '',
    title: 'Reporte del día · DOCU',
    canActivate: [requiresPermission(ROUTE_PERMISSIONS.reports)],
    component: ReportsView,
  },
]
