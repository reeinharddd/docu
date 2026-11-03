import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { appConfig } from './app.config'
import { routes } from './app.routes'
import { AuthService } from './core/auth/auth.service'

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
  ]

  for (const [ruta, titulo] of casos) {
    it(`navigates to ${ruta} and shows "${titulo}"`, async () => {
      const harness = await RouterTestingHarness.create()
      await harness.navigateByUrl(ruta)
      const h1 = harness.routeNativeElement?.querySelector('h1')
      expect(h1?.textContent).toContain(titulo)
    })
  }

  it('redirects the root to /capture', async () => {
    const harness = await RouterTestingHarness.create()
    await harness.navigateByUrl('/')
    expect(
      harness.routeNativeElement?.querySelector('h1')?.textContent,
    ).toContain('Captura')
  })
})
