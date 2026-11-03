import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { appConfig } from './app.config'
import { routes } from './app.routes'

describe('Rutas del caso', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
        provideRouter(routes),
        provideZonelessChangeDetection(),
      ],
    }).compileComponents()
  })

  const casos: Array<[string, string]> = [
    ['/captura', 'Captura'],
    ['/bandeja', 'Bandeja'],
    ['/programa-oficial', 'Programa'],
    ['/busqueda', 'Búsqueda'],
  ]

  for (const [ruta, titulo] of casos) {
    it(`navega a ${ruta} y muestra "${titulo}"`, async () => {
      const harness = await RouterTestingHarness.create()
      await harness.navigateByUrl(ruta)
      const h1 = harness.routeNativeElement?.querySelector('h1')
      expect(h1?.textContent).toContain(titulo)
    })
  }

  it('redirige la raiz a /captura', async () => {
    const harness = await RouterTestingHarness.create()
    await harness.navigateByUrl('/')
    expect(
      harness.routeNativeElement?.querySelector('h1')?.textContent,
    ).toContain('Captura')
  })
})
