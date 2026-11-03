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

  it('emite loading y luego ready con los datos', async () => {
    const estados: unknown[] = []
    client.get<unknown[]>('/cuarentena').subscribe((s) => estados.push(s))
    http.expectOne('/v1/cuarentena').flush([{ id: 'doc-1' }])
    expect(estados).toEqual([
      { status: 'loading' },
      { status: 'ready', data: [{ id: 'doc-1' }] },
    ])
  })

  it('emite empty cuando la lista llega vacia', async () => {
    const estados: unknown[] = []
    client.get<unknown[]>('/oficial-records').subscribe((s) => estados.push(s))
    http.expectOne('/v1/oficial-records').flush([])
    expect(estados).toEqual([{ status: 'loading' }, { status: 'empty' }])
  })

  it('emite error accionable cuando la API falla', async () => {
    const estados: unknown[] = []
    client.get<unknown>('/reports/dia').subscribe((s) => estados.push(s))
    http
      .expectOne('/v1/reports/dia')
      .flush('fallo', { status: 500, statusText: 'Server Error' })
    expect(estados).toEqual([
      { status: 'loading' },
      {
        status: 'error',
        message: expect.stringContaining('No se pudo consultar'),
      },
    ])
  })

  it('prefija las rutas con /v1', () => {
    client.get('/quarantine').subscribe()
    http.expectOne('/v1/quarantine').flush([])
  })
})
