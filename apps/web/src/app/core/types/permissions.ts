/**
 * Permission model of the case (ROLES.md #29): installation -> department ->
 * role -> person. The UI only knows permission KEYS so routes and screens
 * know what to render; the server (RBAC, RF-06) is the real authority.
 * These types are transversal with the backend (same TypeScript): when the
 * shared package exists, they move to packages/ untouched.
 */
export type Department =
  | 'planeacion'
  | 'almacen'
  | 'calidad'
  | 'produccion'
  | 'materiales'
  | 'mantenimiento'
  | 'corporativo'

export type Permission =
  | 'files.upload'
  | 'inbox.review'
  | 'quality.release'
  | 'schedule.view'
  | 'search.view'
  | 'reports.view'
  | 'agent.use'
  | 'apis.manage'
  | 'admin.manage'

export interface Session {
  user: string
  department: Department
  /** Backend token (POST /v1/auth/login). null until #12 lands. */
  token: string | null
  permissions: Permission[]
}

/**
 * DEMO ONLY — never in the final version. The real session comes from the
 * backend (POST /v1/auth/login, RBAC server-side). Used by signInDemo() and
 * by tests until #12 lands; delete with it.
 */
export const DEMO_PERMISSIONS: Permission[] = [
  'files.upload',
  'inbox.review',
  'quality.release',
  'schedule.view',
  'search.view',
  'reports.view',
  'agent.use',
  'apis.manage',
  'admin.manage',
]

/** Route -> permission map: one place to see what each screen requires. */
export const ROUTE_PERMISSIONS = {
  capture: 'files.upload',
  inbox: 'inbox.review',
  schedule: 'schedule.view',
  search: 'search.view',
  reports: 'reports.view',
  agent: 'agent.use',
  apis: 'apis.manage',
  admin: 'admin.manage',
} as const
