import type { Routes } from '@angular/router'
import { requiresPermission } from '../../core/middleware/permissions/guard'
import { ROUTE_PERMISSIONS } from '../../core/types/permissions'
import { InboxView } from './views/inbox-view'

/**
 * Routes of the inbox feature. The feature owns its URL, its title and
 * the permission it needs; the app only mounts it.
 */
export const inboxRoutes: Routes = [
  {
    path: '',
    title: 'Bandeja · DOCU',
    canActivate: [requiresPermission(ROUTE_PERMISSIONS.inbox)],
    component: InboxView,
  },
]
