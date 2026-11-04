import { Component, signal } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { Toasts } from './ui/toasts/toasts'

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Toasts],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly nav = signal([
    { href: '/capture', label: 'Captura' },
    { href: '/inbox', label: 'Bandeja' },
    { href: '/schedule', label: 'Programa' },
    { href: '/search', label: 'Búsqueda' },
  ])
}
