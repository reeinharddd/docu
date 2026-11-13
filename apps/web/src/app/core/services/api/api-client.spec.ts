import { provideHttpClient } from '@angular/common/http'
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { ApiClient } from './api-client'

describe('ApiClient', () => {
  let client: ApiClient
  let http: HttpTestingController

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents()
    client = TestBed.inject(ApiClient)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('emits loading and then ready with the data', async () => {
    const estados: unknown[] = []
    client.get<unknown[]>('/quarantine').subscribe((s) => estados.push(s))
    http.expectOne('/v1/quarantine').flush([{ id: 'doc-1' }])
    expect(estados).toEqual([
      { status: 'loading' },
      { status: 'ready', data: [{ id: 'doc-1' }] },
    ])
  })

  it('emits empty when the list arrives empty', async () => {
    const estados: unknown[] = []
    client.get<unknown[]>('/official-records').subscribe((s) => estados.push(s))
    http.expectOne('/v1/official-records').flush([])
    expect(estados).toEqual([{ status: 'loading' }, { status: 'empty' }])
  })

  it('emits an actionable error when the API fails', async () => {
    const estados: unknown[] = []
    client.get<unknown>('/reports/day').subscribe((s) => estados.push(s))
    http
      .expectOne('/v1/reports/day')
      .flush('boom', { status: 500, statusText: 'Server Error' })
    expect(estados).toEqual([
      { status: 'loading' },
      {
        status: 'error',
        message: expect.stringContaining('No se pudo consultar'),
      },
    ])
  })

  it('prefixes paths with /v1', () => {
    client.get('/quarantine').subscribe()
    http.expectOne('/v1/quarantine').flush([])
  })

  it('maps a backend ApiError body to the error message and code', async () => {
    const estados: unknown[] = []
    client.get<unknown>('/quarantine').subscribe((s) => estados.push(s))
    http
      .expectOne('/v1/quarantine')
      .flush(
        { code: 'VALIDATION_ERROR', message: 'El rollo no tiene certificado.' },
        { status: 422, statusText: 'Unprocessable Entity' },
      )
    expect(estados).toEqual([
      { status: 'loading' },
      {
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'El rollo no tiene certificado.',
      },
    ])
  })

  it('uses the generic message when the body is not an ApiError', async () => {
    const estados: unknown[] = []
    client.get<unknown>('/quarantine').subscribe((s) => estados.push(s))
    http
      .expectOne('/v1/quarantine')
      .flush('oops', { status: 500, statusText: 'Server Error' })
    expect(estados).toEqual([
      { status: 'loading' },
      {
        status: 'error',
        message: expect.stringContaining('No se pudo consultar'),
      },
    ])
  })

  it('post sends the body to /v1 and returns the response', () => {
    let result: unknown
    client
      .post<{ id: string }>('/inbox/abc/confirm')
      .subscribe((r) => (result = r))
    const req = http.expectOne('/v1/inbox/abc/confirm')
    expect(req.request.method).toBe('POST')
    req.flush({ id: 'abc' })
    expect(result).toEqual({ id: 'abc' })
  })

  it('post passes a backend ApiError through', () => {
    let failure: unknown
    client.post('/inbox/abc/confirm').subscribe({ error: (e) => (failure = e) })
    http
      .expectOne('/v1/inbox/abc/confirm')
      .flush(
        { code: 'FORBIDDEN', message: 'Solo Calidad libera.' },
        { status: 403, statusText: 'Forbidden' },
      )
    expect(failure).toEqual({
      code: 'FORBIDDEN',
      message: 'Solo Calidad libera.',
    })
  })

  it('post turns an unknown failure into a generic action error', () => {
    let failure: unknown
    client.post('/files', {}).subscribe({ error: (e) => (failure = e) })
    http
      .expectOne('/v1/files')
      .flush('boom', { status: 500, statusText: 'Server Error' })
    expect(failure).toEqual({
      code: 'INTERNAL',
      message: expect.stringContaining('No se pudo completar'),
    })
  })
})
