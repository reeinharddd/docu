import type { Routes } from '@angular/router'
import { requiresPermission } from '../../core/middleware/permissions/guard'
import { ROUTE_PERMISSIONS } from '../../core/types/permissions'
import { ScheduleView } from './views/schedule-view'

/**
 * Routes of the schedule feature. The feature owns its URL, its title and
 * the permission it needs; the app only mounts it.
 */
export const scheduleRoutes: Routes = [
  {
    path: '',
    title: 'Programa · DOCU',
    canActivate: [requiresPermission(ROUTE_PERMISSIONS.schedule)],
    component: ScheduleView,
  },
]
