import { Component, signal } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { Toasts } from './ui/organisms/toasts/toasts'

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Toasts],
  selector: 'app-root',
  templateUrl: './app.html',
  host: {
    class: 'flex min-h-screen flex-col bg-canvas font-body text-base text-ink',
  },
})
export class App {
  protected readonly nav = signal([
    { href: '/capture', label: 'Captura' },
    { href: '/inbox', label: 'Bandeja' },
    { href: '/schedule', label: 'Programa' },
    { href: '/search', label: 'Búsqueda' },
  ])
}
