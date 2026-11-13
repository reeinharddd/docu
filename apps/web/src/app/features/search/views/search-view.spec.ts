import { provideHttpClient } from '@angular/common/http'
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { RECORDS_FIXTURE } from '../fixtures/search.fixture'
import type { Lineage } from '../model/search'
import { SearchView } from './search-view'

const R017 = RECORDS_FIXTURE.filter((r) => r.keys.includes('R-017'))

const LINEAGE: Lineage = {
  id: 'rec-roll-017',
  chain: [
    {
      type: 'roll',
      label: 'Rollo',
      items: [{ id: 'R-017', detail: 'no asignable', status: 'quarantine' }],
    },
    {
      type: 'production_order',
      label: 'Órdenes en riesgo',
      items: [
        { id: 'ORD-2026-0042', detail: 'Lun 26 · T1', status: 'quarantine' },
      ],
    },
  ],
  history: [
    {
      at: '2026-10-24T09:40:00-07:00',
      action: 'Recepción registrada',
      by: 'Luis (Almacén)',
      fileName: 'recepcion-sab-24oct.xlsx',
      ruleCode: 'R-P1',
    },
  ],
}

describe('SearchView (Búsqueda con cita de fuente, G5)', () => {
  let http: HttpTestingController
  let harness: RouterTestingHarness

  async function open(url: string): Promise<HTMLElement> {
    harness = await RouterTestingHarness.create()
    await harness.navigateByUrl(url)
    return harness.routeNativeElement as HTMLElement
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'search', component: SearchView },
          { path: 'inbox', children: [] },
          { path: 'reports', children: [] },
        ]),
      ],
    }).compileComponents()
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('invites to search when nothing was asked, without calling the API', async () => {
    const el = await open('/search')
    expect(el.querySelector('[data-test="idle"]')?.textContent).toContain(
      'Busca un rollo',
    )
  })

  it('cites file, rule and who confirmed for every value (RF-04)', async () => {
    const el = await open('/search?q=R-017')
    http.expectOne('/v1/official-records?q=R-017').flush(R017)
    http.expectOne(`/v1/lineage/${R017[0]?.id}`).flush(LINEAGE)
    await harness.fixture.whenStable()

    const roll = el.querySelector('[data-test="record-rec-roll-017"]')
    const citation = roll?.querySelector('[data-test="citation"]')
    expect(citation?.textContent).toContain('recepcion-sab-24oct.xlsx')
    expect(citation?.querySelector('[data-rule="R-P1"]')).toBeTruthy()
    expect(
      roll?.querySelector('[data-test="confirmed"]')?.textContent,
    ).toContain('no es dato oficial')

    const scrap = el.querySelector('[data-test="record-rec-scrap-tp01"]')
    expect(
      scrap?.querySelector('[data-test="confirmed"]')?.textContent,
    ).toContain('Jorge (Producción)')
  })

  it('shows the lineage of the first result: roll -> orders', async () => {
    const el = await open('/search?q=R-017')
    http.expectOne('/v1/official-records?q=R-017').flush(R017)
    http.expectOne(`/v1/lineage/${R017[0]?.id}`).flush(LINEAGE)
    await harness.fixture.whenStable()
    const lineage = el.querySelector('[data-test="lineage"]')
    expect(lineage?.querySelector('[data-node="roll"]')?.textContent).toContain(
      'R-017',
    )
    expect(
      lineage?.querySelector('[data-node="production_order"]')?.textContent,
    ).toContain('ORD-2026-0042')
    expect(
      lineage?.querySelector('[data-test="history"]')?.textContent,
    ).toContain('Recepción registrada')
  })

  it('sends area and date filters to the API', async () => {
    await open('/search?q=TP-01&area=produccion&from=2026-10-20')
    http
      .expectOne('/v1/official-records?q=TP-01&area=produccion&from=2026-10-20')
      .flush([])
    await harness.fixture.whenStable()
  })

  it('says nothing was found instead of showing an empty list', async () => {
    const el = await open('/search?q=NADA')
    http.expectOne('/v1/official-records?q=NADA').flush([])
    await harness.fixture.whenStable()
    expect(el.querySelector('[data-test="empty"]')?.textContent).toContain(
      'No encontramos nada',
    )
  })

  it('shows an error and retries the same search', async () => {
    const el = await open('/search?q=R-017')
    http
      .expectOne('/v1/official-records?q=R-017')
      .flush('boom', { status: 500, statusText: 'Server Error' })
    await harness.fixture.whenStable()
    ;(el.querySelector('[data-test="retry"] button') as HTMLElement).click()
    http.expectOne('/v1/official-records?q=R-017').flush([])
    await harness.fixture.whenStable()
  })
})
