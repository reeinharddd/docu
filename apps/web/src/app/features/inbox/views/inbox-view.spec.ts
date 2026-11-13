import { provideHttpClient } from '@angular/common/http'
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { AuthService } from '../../../core/services/auth/auth.service'
import { INBOX_FIXTURE, QUARANTINE_FIXTURE } from '../fixtures/inbox.fixture'
import type { InboxItem } from '../model/inbox'
import { InboxView } from './inbox-view'

describe('InboxView (Bandeja: cuarentena con motivo y confirmación)', () => {
  let http: HttpTestingController
  let harness: RouterTestingHarness

  async function open(url = '/inbox'): Promise<HTMLElement> {
    harness = await RouterTestingHarness.create()
    await harness.navigateByUrl(url)
    return harness.routeNativeElement as HTMLElement
  }

  async function flushBoth(
    quarantine: InboxItem[] = QUARANTINE_FIXTURE,
    inbox: InboxItem[] = INBOX_FIXTURE,
  ): Promise<void> {
    http.expectOne('/v1/quarantine').flush(quarantine)
    http.expectOne('/v1/inbox').flush(inbox)
    await harness.fixture.whenStable()
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'inbox', component: InboxView },
          { path: 'search', children: [] },
          { path: 'capture', children: [] },
        ]),
      ],
    }).compileComponents()
    http = TestBed.inject(HttpTestingController)
    TestBed.inject(AuthService).signInDemo()
  })

  afterEach(() => http.verify())

  it('shows loading while both reads are in flight', async () => {
    const el = await open()
    expect(el.querySelectorAll('[data-test="loading"]').length).toBe(2)
    await flushBoth()
  })

  it('shows every stopped item with its reason and rule (RF-02, G2)', async () => {
    const el = await open()
    await flushBoth()
    const r017 = el.querySelector('[data-test="item-q-r017-cert"]')
    expect(r017?.getAttribute('data-status')).toBe('quarantine')
    expect(r017?.querySelector('[data-test="reason"]')?.textContent).toContain(
      'sin certificado',
    )
    expect(r017?.querySelector('[data-rule="R-P1"]')).toBeTruthy()
    expect(
      r017?.querySelector('[data-test="to-origin"]')?.getAttribute('href'),
    ).toBe('/search?q=R-017')
  })

  it('shows who confirmed an official item and when (RF-03)', async () => {
    const el = await open()
    await flushBoth()
    const official = el.querySelector('[data-test="item-i-programa-rev3"]')
    expect(
      official?.querySelector('[data-test="badge"]')?.textContent,
    ).toContain('Oficial · Andrés')
    expect(
      official?.querySelector('[data-test="confirmed-by"]')?.textContent,
    ).toContain('Andrés (Materiales)')
  })

  it('invites to upload when nothing is stopped', async () => {
    const el = await open()
    await flushBoth([], [])
    const empty = el.querySelector(
      '[data-test="quarantine-section"] [data-test="empty"]',
    )
    expect(empty?.textContent).toContain('Nada detenido')
  })

  it('shows an actionable error and retries the read', async () => {
    const el = await open()
    http
      .expectOne('/v1/quarantine')
      .flush('boom', { status: 500, statusText: 'Server Error' })
    http.expectOne('/v1/inbox').flush(INBOX_FIXTURE)
    await harness.fixture.whenStable()
    const error = el.querySelector(
      '[data-test="quarantine-section"] [data-test="error"]',
    )
    expect(error?.textContent).toContain('No se pudo consultar')
    ;(
      el.querySelector(
        '[data-test="quarantine-section"] [data-test="retry"] button',
      ) as HTMLElement
    ).click()
    http.expectOne('/v1/quarantine').flush(QUARANTINE_FIXTURE)
    await harness.fixture.whenStable()
    expect(el.querySelector('[data-test="item-q-r017-cert"]')).toBeTruthy()
  })

  it('confirms a pending item and reloads the inbox', async () => {
    const el = await open()
    await flushBoth()
    ;(
      el.querySelector(
        '[data-test="item-i-merma-tp01"] [data-test="confirm"] button',
      ) as HTMLElement
    ).click()
    const req = http.expectOne('/v1/inbox/i-merma-tp01/confirm')
    expect(req.request.method).toBe('POST')
    req.flush({ id: 'i-merma-tp01', status: 'official', version: 2 })
    http.expectOne('/v1/inbox').flush(
      INBOX_FIXTURE.map((i) =>
        i.id === 'i-merma-tp01'
          ? {
              ...i,
              status: 'official',
              confirmation: { by: 'Ana', at: '2026-10-26T16:00:00-07:00' },
            }
          : i,
      ),
    )
    await harness.fixture.whenStable()
    const after = el.querySelector('[data-test="item-i-merma-tp01"]')
    expect(after?.getAttribute('data-status')).toBe('official')
    expect(after?.querySelector('[data-test="badge"]')?.textContent).toContain(
      'Oficial · Ana',
    )
  })

  it('does not offer to confirm a QA release without quality.release (R-Q1)', async () => {
    TestBed.inject(AuthService).setSessionWithout('quality.release')
    const el = await open()
    await flushBoth()
    const qa = el.querySelector('[data-test="item-i-qa-l2610-07"]')
    expect(qa?.querySelector('[data-test="confirm"]')).toBeNull()
    expect(qa?.querySelector('[data-test="locked"]')?.textContent).toContain(
      'Solo Calidad',
    )
  })

  it('sends to quarantine only with a written reason', async () => {
    const el = await open()
    await flushBoth()
    const card = () =>
      el.querySelector('[data-test="item-i-conteo-tyvek"]') as HTMLElement
    ;(
      card().querySelector('[data-test="reject"] button') as HTMLElement
    ).click()
    await harness.fixture.whenStable()
    const submit = card().querySelector(
      '[data-test="reject-submit"] button',
    ) as HTMLButtonElement
    expect(submit.disabled).toBe(true)

    const reason = card().querySelector(
      '[data-test="reject-reason"]',
    ) as HTMLTextAreaElement
    reason.value = 'El conteo omitió el rack B'
    reason.dispatchEvent(new Event('input'))
    await harness.fixture.whenStable()
    expect(submit.disabled).toBe(false)
    submit.click()

    const req = http.expectOne('/v1/inbox/i-conteo-tyvek/reject')
    expect(req.request.body).toEqual({ reason: 'El conteo omitió el rack B' })
    req.flush({ id: 'i-conteo-tyvek', status: 'quarantine', version: 2 })
    http.expectOne('/v1/inbox').flush(INBOX_FIXTURE)
    http.expectOne('/v1/quarantine').flush(QUARANTINE_FIXTURE)
    await harness.fixture.whenStable()
  })

  it('filters by the rule in the URL (link from Programa)', async () => {
    const el = await open('/inbox?rule=R-P2')
    await flushBoth()
    const stopped = el.querySelectorAll(
      '[data-test="quarantine-section"] article',
    )
    expect(stopped.length).toBe(1)
    expect(stopped[0]?.getAttribute('data-test')).toBe('item-q-r019-medida')
    expect(el.querySelector('[data-test="clear-filters"]')).toBeTruthy()
  })
})
