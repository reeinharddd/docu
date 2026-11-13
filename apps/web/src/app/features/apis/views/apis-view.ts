import { Component, signal } from '@angular/core'
import { Button } from '../../../ui/atoms/button/button'
import { Icon } from '../../../ui/atoms/icon/icon'
import {
  StatusBadge,
  type StatusKind,
} from '../../../ui/atoms/status-badge/status-badge'
import { PageHeader } from '../../../ui/molecules/page-header/page-header'

/**
 * DEMO ONLY — mock-up of the API console: endpoints of the contract
 * (ARQUITECTURA.md §3.1) with their state, keys for integrations,
 * monitoring and the AI engines as configuration (#85). Figures are
 * illustrative until the API (#12) and its metrics exist.
 */
export interface Endpoint {
  method: 'GET' | 'POST'
  path: string
  module: string
  permission: string
  state: 'live' | 'building' | 'planned'
  p95: number | null
  calls24h: number | null
  errors: number | null
}

const STATE: Record<Endpoint['state'], { kind: StatusKind; label: string }> = {
  live: { kind: 'official', label: 'Disponible' },
  building: { kind: 'pending', label: 'En construcción' },
  planned: { kind: 'ai', label: 'Planeado' },
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/health',
    module: 'health',
    permission: 'público',
    state: 'live',
    p95: 18,
    calls24h: 1440,
    errors: 0,
  },
  {
    method: 'POST',
    path: '/v1/auth/login',
    module: 'auth',
    permission: 'público',
    state: 'building',
    p95: 95,
    calls24h: 64,
    errors: 3,
  },
  {
    method: 'POST',
    path: '/v1/files',
    module: 'files',
    permission: 'create + submit',
    state: 'building',
    p95: 240,
    calls24h: 186,
    errors: 2,
  },
  {
    method: 'GET',
    path: '/v1/files/:id/validation',
    module: 'validation',
    permission: 'read',
    state: 'building',
    p95: 60,
    calls24h: 186,
    errors: 0,
  },
  {
    method: 'GET',
    path: '/v1/quarantine',
    module: 'quarantine',
    permission: 'read',
    state: 'building',
    p95: 45,
    calls24h: 92,
    errors: 0,
  },
  {
    method: 'POST',
    path: '/v1/inbox/:id/confirm',
    module: 'inbox',
    permission: 'confirm',
    state: 'building',
    p95: 70,
    calls24h: 31,
    errors: 1,
  },
  {
    method: 'GET',
    path: '/v1/official-records',
    module: 'official-records',
    permission: 'read',
    state: 'building',
    p95: 80,
    calls24h: 210,
    errors: 0,
  },
  {
    method: 'GET',
    path: '/v1/lineage/:id',
    module: 'lineage',
    permission: 'read',
    state: 'planned',
    p95: null,
    calls24h: null,
    errors: null,
  },
  {
    method: 'GET',
    path: '/v1/reports/day',
    module: 'reports',
    permission: 'read',
    state: 'planned',
    p95: null,
    calls24h: null,
    errors: null,
  },
  {
    method: 'POST',
    path: '/v1/sources/:id/sync',
    module: 'sources',
    permission: 'create',
    state: 'planned',
    p95: null,
    calls24h: null,
    errors: null,
  },
]

export interface ApiKey {
  id: string
  name: string
  prefix: string
  scopes: string
  lastUsed: string
  active: boolean
}

@Component({
  imports: [Button, Icon, PageHeader, StatusBadge],
  selector: 'app-apis',
  templateUrl: './apis-view.html',
})
export class ApisView {
  protected readonly endpoints = ENDPOINTS
  protected readonly state = STATE
  protected readonly live = ENDPOINTS.filter((e) => e.state === 'live').length
  protected readonly building = ENDPOINTS.filter(
    (e) => e.state === 'building',
  ).length

  readonly keys = signal<ApiKey[]>([
    {
      id: 'k1',
      name: 'Sincronización SAP (mock)',
      prefix: 'docu_live_7f3a',
      scopes: 'sources:sync',
      lastUsed: 'hace 2 h',
      active: true,
    },
    {
      id: 'k2',
      name: 'Exportación de reportes',
      prefix: 'docu_live_c91e',
      scopes: 'reports:read',
      lastUsed: 'hace 1 día',
      active: true,
    },
    {
      id: 'k3',
      name: 'Prueba de integración',
      prefix: 'docu_test_02bd',
      scopes: 'files:create',
      lastUsed: 'hace 12 días',
      active: false,
    },
  ])

  revoke(id: string): void {
    this.keys.update((all) =>
      all.map((k) => (k.id === id ? { ...k, active: false } : k)),
    )
  }
}
