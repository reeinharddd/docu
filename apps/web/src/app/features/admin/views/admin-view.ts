import { Component, computed, signal } from '@angular/core'
import { Icon } from '../../../ui/atoms/icon/icon'
import {
  StatusBadge,
  type StatusKind,
} from '../../../ui/atoms/status-badge/status-badge'
import { PageHeader } from '../../../ui/molecules/page-header/page-header'

/**
 * DEMO ONLY — mock-up of the global administration panel. DOCU is a generic
 * tool: each company runs its own installations and turns features on, sets
 * catalogs and rules as data (RF-08), without code. The team panel ties
 * every module to its owner and its issue, which is how the group works.
 */
export type InstallationId = 'c1' | 'c2'

export interface Installation {
  id: InstallationId
  name: string
  note: string
}

export interface Feature {
  id: string
  label: string
  detail: string
  enabled: Record<InstallationId, boolean>
}

export interface ModuleOwner {
  module: string
  owner: string
  issue: string
  state: { kind: StatusKind; label: string }
}

const INSTALLATIONS: Installation[] = [
  {
    id: 'c1',
    name: 'Configuración 1',
    note: 'Planta de empaque médico (caso de demostración)',
  },
  {
    id: 'c2',
    name: 'Configuración 2',
    note: 'Segunda instalación mínima, cargada solo con datos',
  },
]

const FEATURES: Feature[] = [
  {
    id: 'capture',
    label: 'Captura',
    detail: 'Subida de archivos y clasificación por familia',
    enabled: { c1: true, c2: true },
  },
  {
    id: 'inbox',
    label: 'Bandeja',
    detail: 'Cuarentena con motivo y confirmación humana',
    enabled: { c1: true, c2: true },
  },
  {
    id: 'schedule',
    label: 'Programa',
    detail: 'Programa semanal con bloqueos vivos',
    enabled: { c1: true, c2: false },
  },
  {
    id: 'search',
    label: 'Búsqueda',
    detail: 'Consulta con cita de fuente y trazabilidad',
    enabled: { c1: true, c2: true },
  },
  {
    id: 'reports',
    label: 'Reporte y alertas',
    detail: '1 reporte recurrente y 1 alerta por umbral',
    enabled: { c1: true, c2: true },
  },
  {
    id: 'agent',
    label: 'Agente de IA',
    detail: 'Preguntas en lenguaje natural con citas',
    enabled: { c1: true, c2: false },
  },
]

const OWNERS: ModuleOwner[] = [
  {
    module: 'Caso, arquitectura e IA',
    owner: 'Erik Alfonso Beltrán Ramírez',
    issue: '#83 · #60 · #85',
    state: { kind: 'pending', label: 'En progreso' },
  },
  {
    module: 'API, ingesta y permisos',
    owner: 'Emmanuel Valenzuela Cruz',
    issue: '#12 · #3 · #5',
    state: { kind: 'pending', label: 'En progreso' },
  },
  {
    module: 'Frontend y diseño',
    owner: 'Kira Llizara Garfias González',
    issue: '#11 · #4',
    state: { kind: 'pending', label: 'En progreso' },
  },
  {
    module: 'Dataset y pruebas',
    owner: 'Carlos Ariel Martín Rojas',
    issue: '#61 · #86',
    state: { kind: 'pending', label: 'En progreso' },
  },
  {
    module: 'Plataforma frontend',
    owner: 'Erik Alfonso Beltrán Ramírez',
    issue: '#84',
    state: { kind: 'official', label: 'Entregado' },
  },
  {
    module: 'Marca y design system',
    owner: 'Kira Llizara Garfias González',
    issue: '#41',
    state: { kind: 'official', label: 'Entregado' },
  },
]

const ACTIVITY = [
  {
    at: '11 nov, 21:03',
    who: 'Ana (Planeación)',
    what: 'confirmó la merma de TP-01 del 26-oct',
  },
  {
    at: '11 nov, 18:40',
    who: 'Administrador',
    what: 'activó el Agente de IA en Configuración 1',
  },
  {
    at: '10 nov, 12:15',
    who: 'Administrador',
    what: 'agregó la regla R-T1 (stock mínimo) como dato',
  },
  {
    at: '9 nov, 09:02',
    who: 'Administrador',
    what: 'cargó Configuración 2 sin cambiar código',
  },
]

@Component({
  imports: [Icon, PageHeader, StatusBadge],
  selector: 'app-admin',
  templateUrl: './admin-view.html',
})
export class AdminView {
  protected readonly installations = INSTALLATIONS
  protected readonly owners = OWNERS
  protected readonly activity = ACTIVITY

  readonly current = signal<InstallationId>('c1')
  readonly features = signal(FEATURES)
  readonly currentInstallation = computed(
    () =>
      INSTALLATIONS.find((i) => i.id === this.current()) ?? INSTALLATIONS[0],
  )
  readonly activeCount = computed(
    () => this.features().filter((f) => f.enabled[this.current()]).length,
  )

  toggle(id: string): void {
    const inst = this.current()
    this.features.update((all) =>
      all.map((f) =>
        f.id === id
          ? { ...f, enabled: { ...f.enabled, [inst]: !f.enabled[inst] } }
          : f,
      ),
    )
  }
}
