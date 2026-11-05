import type { Routes } from '@angular/router'
import { requiresPermission } from '../../core/middleware/permissions/guard'
import { ROUTE_PERMISSIONS } from '../../core/types/permissions'
import { CaptureView } from './views/capture-view'

/**
 * Routes of the capture feature. The feature owns its URL, its title and
 * the permission it needs; the app only mounts it.
 */
export const captureRoutes: Routes = [
  {
    path: '',
    title: 'Captura · DOCU',
    canActivate: [requiresPermission(ROUTE_PERMISSIONS.capture)],
    component: CaptureView,
  },
]
