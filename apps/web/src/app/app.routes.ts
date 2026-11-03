import type { Routes } from '@angular/router'

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'captura' },
  {
    path: 'captura',
    title: 'Captura · DOCU',
    loadComponent: () =>
      import('./features/captura/captura').then((m) => m.Captura),
  },
  {
    path: 'bandeja',
    title: 'Bandeja · DOCU',
    loadComponent: () =>
      import('./features/bandeja/bandeja').then((m) => m.Bandeja),
  },
  {
    path: 'programa-oficial',
    title: 'Programa · DOCU',
    loadComponent: () =>
      import('./features/programa/programa').then((m) => m.Programa),
  },
  {
    path: 'busqueda',
    title: 'Búsqueda · DOCU',
    loadComponent: () =>
      import('./features/busqueda/busqueda').then((m) => m.Busqueda),
  },
]
