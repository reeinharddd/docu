import { Component, computed, effect, inject, signal } from '@angular/core'
import { Router, RouterLink, RouterOutlet } from '@angular/router'
import { AuthService } from './core/services/auth/auth.service'
import { DEPARTMENT_LABELS } from './core/types/catalog'
import type { Permission } from './core/types/permissions'
import { ROUTE_PERMISSIONS } from './core/types/permissions'
import { Icon } from './ui/atoms/icon/icon'
import type { IconName } from './ui/atoms/icon/icon-paths'
import {
  SideMenu,
  type SideMenuGroup,
} from './ui/organisms/side-menu/side-menu'
import { Toasts } from './ui/organisms/toasts/toasts'

interface NavItem {
  href: string
  label: string
  icon: IconName
  permission: Permission
}

interface NavGroup {
  label: string
  items: NavItem[]
}

/**
 * The screens of the case in the order subir -> revisar -> consultar, then
 * the tools. Each item names the permission its route requires.
 */
const NAV: NavGroup[] = [
  {
    label: 'Flujo del caso',
    items: [
      {
        href: '/capture',
        label: 'Captura',
        icon: 'upload',
        permission: ROUTE_PERMISSIONS.capture,
      },
      {
        href: '/inbox',
        label: 'Bandeja',
        icon: 'inbox',
        permission: ROUTE_PERMISSIONS.inbox,
      },
      {
        href: '/schedule',
        label: 'Programa',
        icon: 'calendar',
        permission: ROUTE_PERMISSIONS.schedule,
      },
      {
        href: '/search',
        label: 'Búsqueda',
        icon: 'search',
        permission: ROUTE_PERMISSIONS.search,
      },
      {
        href: '/reports',
        label: 'Reporte del día',
        icon: 'chart',
        permission: ROUTE_PERMISSIONS.reports,
      },
    ],
  },
  {
    label: 'Herramientas',
    items: [
      {
        href: '/agent',
        label: 'Agente',
        icon: 'sparkles',
        permission: ROUTE_PERMISSIONS.agent,
      },
      {
        href: '/apis',
        label: 'APIs',
        icon: 'code',
        permission: ROUTE_PERMISSIONS.apis,
      },
      {
        href: '/admin',
        label: 'Administración',
        icon: 'settings',
        permission: ROUTE_PERMISSIONS.admin,
      },
    ],
  },
]

@Component({
  imports: [Icon, RouterOutlet, RouterLink, SideMenu, Toasts],
  selector: 'app-root',
  templateUrl: './app.html',
  host: {
    class: 'flex min-h-screen bg-canvas font-body text-base text-ink',
    '(document:keydown.escape)': 'closeMenu()',
  },
})
export class App {
  private readonly auth = inject(AuthService)
  private readonly router = inject(Router)

  /** Only the screens the session can open; empty groups disappear. */
  protected readonly groups = computed<SideMenuGroup[]>(() =>
    NAV.map((g) => ({
      label: g.label,
      items: g.items.filter((item) => this.auth.can(item.permission)),
    })).filter((g) => g.items.length > 0),
  )
  protected readonly hasMenu = computed(() => this.groups().length > 0)
  protected readonly user = computed(() => this.auth.session()?.user ?? null)
  protected readonly department = computed(() => {
    const d = this.auth.session()?.department
    return d ? DEPARTMENT_LABELS[d] : null
  })

  protected readonly menuOpen = signal(false)
  /** Desktop rail put away (icons only); remembered per browser. */
  readonly collapsed = signal(readCollapsed())

  constructor() {
    effect(() => writeCollapsed(this.collapsed()))
  }

  toggleCollapsed(): void {
    this.collapsed.update((c) => !c)
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open)
  }

  closeMenu(): void {
    this.menuOpen.set(false)
  }

  signOut(): void {
    this.closeMenu()
    this.auth.signOut()
    void this.router.navigate(['/login'])
  }
}

/**
 * Only a viewer convenience: if storage is blocked (private window,
 * policies) the rail simply starts open. It never holds session data.
 */
const COLLAPSED_KEY = 'docu.sideMenu.collapsed'

function readCollapsed(): boolean {
  try {
    return globalThis.localStorage?.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

function writeCollapsed(collapsed: boolean): void {
  try {
    globalThis.localStorage?.setItem(COLLAPSED_KEY, collapsed ? '1' : '0')
  } catch {
    // Storage unavailable: the preference is just not remembered.
  }
}
