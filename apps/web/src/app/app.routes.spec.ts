import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { appConfig } from './app.config'
import { routes } from './app.routes'
import { AuthService } from './core/services/auth/auth.service'

describe('Case routes', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideRouter(routes)],
    }).compileComponents()
    TestBed.inject(AuthService).signInDemo()
  })

  const casos: Array<[string, string]> = [
    ['/capture', 'Captura'],
    ['/inbox', 'Bandeja'],
    ['/schedule', 'Programa'],
    ['/search', 'Búsqueda'],
    ['/reports', 'Reporte del día'],
    ['/agent', 'Agente'],
    ['/apis', 'APIs'],
    ['/admin', 'Administración'],
  ]

  for (const [ruta, titulo] of casos) {
    it(`navigates to ${ruta} and shows "${titulo}"`, async () => {
      const harness = await RouterTestingHarness.create()
      await harness.navigateByUrl(ruta)
      const h1 = harness.routeNativeElement?.querySelector('h1')
      expect(h1?.textContent).toContain(titulo)
    })
  }

  it('every feature owns its routes through a lazy loadChildren', () => {
    const features = [
      'capture',
      'inbox',
      'schedule',
      'search',
      'reports',
      'agent',
      'apis',
      'admin',
      'login',
      'forbidden',
    ]
    for (const feature of features) {
      const route = routes.find((r) => r.path === feature)
      expect(route, `route /${feature} exists`).toBeTruthy()
      expect(
        route?.loadChildren,
        `route /${feature} is feature-owned`,
      ).toBeTypeOf('function')
    }
  })

  it('redirects the root to /capture', async () => {
    const harness = await RouterTestingHarness.create()
    await harness.navigateByUrl('/')
    expect(
      harness.routeNativeElement?.querySelector('h1')?.textContent,
    ).toContain('Captura')
  })
})
