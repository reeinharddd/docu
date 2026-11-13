import { Component, computed, inject, signal } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { AuthService } from './core/services/auth/auth.service'
import type { Permission } from './core/types/permissions'
import { ROUTE_PERMISSIONS } from './core/types/permissions'
import { Toasts } from './ui/organisms/toasts/toasts'

interface NavItem {
  href: string
  label: string
  permission: Permission
}

/** The five screens of the case, in the order subir -> revisar -> consultar. */
const NAV: NavItem[] = [
  { href: '/capture', label: 'Captura', permission: ROUTE_PERMISSIONS.capture },
  { href: '/inbox', label: 'Bandeja', permission: ROUTE_PERMISSIONS.inbox },
  {
    href: '/schedule',
    label: 'Programa',
    permission: ROUTE_PERMISSIONS.schedule,
  },
  { href: '/search', label: 'Búsqueda', permission: ROUTE_PERMISSIONS.search },
  {
    href: '/reports',
    label: 'Reporte',
    permission: ROUTE_PERMISSIONS.reports,
  },
  { href: '/agent', label: 'Agente', permission: ROUTE_PERMISSIONS.agent },
  { href: '/apis', label: 'APIs', permission: ROUTE_PERMISSIONS.apis },
  { href: '/admin', label: 'Admin', permission: ROUTE_PERMISSIONS.admin },
]

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Toasts],
  selector: 'app-root',
  templateUrl: './app.html',
  host: {
    class: 'flex min-h-screen flex-col bg-canvas font-body text-base text-ink',
  },
})
export class App {
  private readonly auth = inject(AuthService)

  /** Only the screens the session can open; the rest are not shown. */
  protected readonly nav = computed(() =>
    NAV.filter((item) => this.auth.can(item.permission)),
  )
  protected readonly menuOpen = signal(false)

  toggleMenu(): void {
    this.menuOpen.update((open) => !open)
  }

  closeMenu(): void {
    this.menuOpen.set(false)
  }
}
