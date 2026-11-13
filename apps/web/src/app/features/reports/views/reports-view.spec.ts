import { provideHttpClient } from '@angular/common/http'
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { REPORTS_FIXTURE } from '../fixtures/reports.fixture'
import { DEFAULT_DAY, ReportsView } from './reports-view'

const MONDAY = REPORTS_FIXTURE['2026-10-26']
const FRIDAY = REPORTS_FIXTURE['2026-10-23']

describe('ReportsView (Reporte del día con origen y alerta, G6)', () => {
  let fixture: ComponentFixture<ReportsView>
  let el: HTMLElement
  let http: HttpTestingController

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsView],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents()
    http = TestBed.inject(HttpTestingController)
    fixture = TestBed.createComponent(ReportsView)
    el = fixture.nativeElement as HTMLElement
    await fixture.whenStable()
  })

  afterEach(() => http.verify())

  it('every number cites its origin and links to it (RF-04)', async () => {
    expect(el.querySelector('[data-test="loading"]')).toBeTruthy()
    http.expectOne(`/v1/reports/day?date=${DEFAULT_DAY}`).flush(MONDAY)
    await fixture.whenStable()

    const items = el.querySelectorAll('[data-test^="item-"]')
    expect(items.length).toBe(MONDAY?.items.length)
    for (const item of Array.from(items)) {
      expect(item.querySelector('[data-test="origin"]')?.textContent).toMatch(
        /D-\d+/,
      )
      expect(
        item.querySelector('[data-test="to-origin"]')?.getAttribute('href'),
      ).toMatch(/^\/search\?q=/)
    }
  })

  it('fires the alert when a metric crosses its threshold (RF-05)', async () => {
    http.expectOne(`/v1/reports/day?date=${DEFAULT_DAY}`).flush(MONDAY)
    await fixture.whenStable()
    const alert = el.querySelector('[data-test="alert"]')
    expect(alert?.textContent).toContain('Merma TP-01')
    expect(alert?.textContent).toContain('umbral 20')
  })

  it('marks a report paused by a sister plant change (R-P4)', async () => {
    http.expectOne(`/v1/reports/day?date=${DEFAULT_DAY}`).flush(MONDAY)
    await fixture.whenStable()
    fixture.componentInstance.onDayChange('2026-10-23')
    http.expectOne('/v1/reports/day?date=2026-10-23').flush(FRIDAY)
    await fixture.whenStable()
    expect(el.querySelector('[data-test="paused"]')?.textContent).toContain(
      'pausado',
    )
    expect(
      el.querySelector('[data-test="paused"] [data-rule="R-P4"]'),
    ).toBeTruthy()
  })

  it('a day without confirmed data is empty, not an error', async () => {
    http.expectOne(`/v1/reports/day?date=${DEFAULT_DAY}`).flush({
      date: DEFAULT_DAY,
      generatedAt: '',
      total: 0,
      items: [],
      alerts: [],
      paused: null,
    })
    await fixture.whenStable()
    expect(el.querySelector('[data-test="empty"]')?.textContent).toContain(
      'todavía no tiene datos confirmados',
    )
  })

  it('shows an error and retries', async () => {
    http
      .expectOne(`/v1/reports/day?date=${DEFAULT_DAY}`)
      .flush('boom', { status: 500, statusText: 'Server Error' })
    await fixture.whenStable()
    ;(el.querySelector('[data-test="retry"] button') as HTMLElement).click()
    http.expectOne(`/v1/reports/day?date=${DEFAULT_DAY}`).flush(MONDAY)
    await fixture.whenStable()
    expect(el.querySelector('[data-test="alert"]')).toBeTruthy()
  })
})
