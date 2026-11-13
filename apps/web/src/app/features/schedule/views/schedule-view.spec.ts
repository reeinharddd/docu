import { provideHttpClient } from '@angular/common/http'
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { SCHEDULE_FIXTURE } from '../fixtures/schedule.fixture'
import { DEFAULT_WEEK, ScheduleView } from './schedule-view'

const WEEK_URL = `/v1/official-records?type=production_schedule&week=${DEFAULT_WEEK}`

describe('ScheduleView (Programa: bloqueos vivos, G4)', () => {
  let fixture: ComponentFixture<ScheduleView>
  let el: HTMLElement
  let http: HttpTestingController

  const click = (selector: string) =>
    (el.querySelector(`${selector} button`) as HTMLElement).click()

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleView],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents()
    http = TestBed.inject(HttpTestingController)
    fixture = TestBed.createComponent(ScheduleView)
    el = fixture.nativeElement as HTMLElement
    await fixture.whenStable()
  })

  afterEach(() => http.verify())

  it('shows loading, then each row with its live blocks and shortcuts', async () => {
    expect(el.querySelector('[data-test="loading"]')).toBeTruthy()
    http.expectOne(WEEK_URL).flush(SCHEDULE_FIXTURE)
    await fixture.whenStable()

    const row = el.querySelector('[data-test="row-e01"]')
    expect(row?.getAttribute('data-state')).toBe('blocked')
    expect(row?.querySelector('[data-test="state"]')?.textContent).toContain(
      'No asignable',
    )
    expect(row?.querySelector('[data-rule="R-P1"]')).toBeTruthy()
    expect(row?.querySelector('[data-test="why"]')?.getAttribute('href')).toBe(
      '/inbox?rule=R-P1',
    )
    expect(
      row?.querySelector('[data-test="to-trace"]')?.getAttribute('href'),
    ).toBe('/search?q=R-017')
  })

  it('counts blocked orders and shows missing material and minimum stock', async () => {
    http.expectOne(WEEK_URL).flush(SCHEDULE_FIXTURE)
    await fixture.whenStable()
    const blocked = SCHEDULE_FIXTURE.entries.filter(
      (e) => e.state === 'blocked',
    )
    expect(
      el.querySelector('[data-test="count-blocked"]')?.textContent?.trim(),
    ).toBe(String(blocked.length))
    expect(
      el.querySelector('[data-test="row-e06"] [data-rule="R-P3"]'),
    ).toBeTruthy()
    expect(
      el.querySelector('[data-test="row-e08"] [data-rule="R-T1"]'),
    ).toBeTruthy()
  })

  it('treats a week without rows as empty, not as an error', async () => {
    http.expectOne(WEEK_URL).flush({ ...SCHEDULE_FIXTURE, entries: [] })
    await fixture.whenStable()
    expect(el.querySelector('[data-test="empty"]')?.textContent).toContain(
      'Aún no hay programa',
    )
  })

  it('shows an error and retries', async () => {
    http
      .expectOne(WEEK_URL)
      .flush('boom', { status: 500, statusText: 'Server Error' })
    await fixture.whenStable()
    click('[data-test="retry"]')
    http.expectOne(WEEK_URL).flush(SCHEDULE_FIXTURE)
    await fixture.whenStable()
    expect(el.querySelector('[data-test="row-e01"]')).toBeTruthy()
  })

  it('asks for the next week', async () => {
    http.expectOne(WEEK_URL).flush(SCHEDULE_FIXTURE)
    await fixture.whenStable()
    click('[data-test="next-week"]')
    http
      .expectOne(
        '/v1/official-records?type=production_schedule&week=2026-11-02',
      )
      .flush({ ...SCHEDULE_FIXTURE, week: '2026-11-02', entries: [] })
    await fixture.whenStable()
  })

  it('asks the SAP source to sync', async () => {
    http.expectOne(WEEK_URL).flush(SCHEDULE_FIXTURE)
    await fixture.whenStable()
    click('[data-test="sync"]')
    const req = http.expectOne('/v1/sources/sap/sync')
    expect(req.request.method).toBe('POST')
    req.flush({ jobId: 'job-1' })
  })
})
