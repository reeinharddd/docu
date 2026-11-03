import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { App } from './app'
import { routes } from './app.routes'

describe('App (shell de la plataforma)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideZonelessChangeDetection(), provideRouter(routes)],
    }).compileComponents()
  })

  it('crea la app', () => {
    const fixture = TestBed.createComponent(App)
    expect(fixture.componentInstance).toBeTruthy()
  })

  it('muestra el wordmark docu con la u en acento', async () => {
    const fixture = TestBed.createComponent(App)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    const wordmark = el.querySelector('.wordmark')
    expect(wordmark?.textContent).toContain('docu')
    expect(el.querySelector('.wordmark-u')).toBeTruthy()
  })

  it('navega con las 4 rutas del caso', async () => {
    const fixture = TestBed.createComponent(App)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    const links = Array.from(el.querySelectorAll('nav a'))
    const rutas = links.map((a) => a.getAttribute('href'))
    expect(rutas).toEqual([
      '/captura',
      '/bandeja',
      '/programa-oficial',
      '/busqueda',
    ])
  })
})
