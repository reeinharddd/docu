import type { Routes } from '@angular/router'
import { requiresPermission } from '../../core/middleware/permissions/guard'
import { ROUTE_PERMISSIONS } from '../../core/types/permissions'
import { SearchView } from './views/search-view'

/**
 * Routes of the search feature. The feature owns its URL, its title and
 * the permission it needs; the app only mounts it.
 */
export const searchRoutes: Routes = [
  {
    path: '',
    title: 'Búsqueda · DOCU',
    canActivate: [requiresPermission(ROUTE_PERMISSIONS.search)],
    component: SearchView,
  },
]
