import { Component, input, output } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { Icon } from '../../atoms/icon/icon'
import type { IconName } from '../../atoms/icon/icon-paths'

export interface SideMenuItem {
  href: string
  label: string
  icon: IconName
}

export interface SideMenuGroup {
  label: string
  items: SideMenuItem[]
}

/**
 * Side navigation (organism). The same content serves the fixed column on
 * desktop and the drawer on a phone; the app decides where it lives. Only
 * the screens the session can open reach it (the app filters by permission).
 */
@Component({
  imports: [Icon, RouterLink, RouterLinkActive],
  selector: 'app-side-menu',
  templateUrl: './side-menu.html',
  host: { class: 'flex h-full flex-col' },
})
export class SideMenu {
  readonly groups = input.required<SideMenuGroup[]>()
  readonly user = input<string | null>(null)
  readonly department = input<string | null>(null)
  /** Accessible name of the nav landmark (two menus may coexist). */
  readonly label = input('Navegación principal')
  /** Put-away rail: icons only, the name shows on hover or focus. */
  readonly compact = input(false)

  /** A link was chosen: the drawer closes. */
  readonly navigated = output<void>()
  readonly signOut = output<void>()
}
