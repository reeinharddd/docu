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
})
