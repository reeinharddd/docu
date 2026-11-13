import type { Routes } from '@angular/router'
import { requiresPermission } from '../../core/middleware/permissions/guard'
import { ROUTE_PERMISSIONS } from '../../core/types/permissions'
import { AgentView } from './views/agent-view'

/**
 * Routes of the agent feature (DEMO mock-up for the course report: the
 * screen is designed, its backend is not built yet).
 */
export const agentRoutes: Routes = [
  {
    path: '',
    title: 'Agente · DOCU',
    canActivate: [requiresPermission(ROUTE_PERMISSIONS.agent)],
    component: AgentView,
  },
]
