import type { Routes } from '@angular/router'
import { LoginView } from './views/login-view'

/**
 * Routes of the login feature. Public: no session is required to see it.
 */
export const loginRoutes: Routes = [
  {
    path: '',
    title: 'Acceso · DOCU',
    component: LoginView,
  },
]
