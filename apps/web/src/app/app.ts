import { Component, signal } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly nav = signal([
    { href: '/captura', label: 'Captura' },
    { href: '/bandeja', label: 'Bandeja' },
    { href: '/programa-oficial', label: 'Programa' },
    { href: '/busqueda', label: 'Búsqueda' },
  ])
}
