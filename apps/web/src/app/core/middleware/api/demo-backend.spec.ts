import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http'
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { firstValueFrom } from 'rxjs'
import { AuthService } from '../../services/auth/auth.service'
import {
  DEMO_LATENCY_MS,
  demoBackendInterceptor,
  provideDemoBackend,
} from './demo-backend'

describe('demoBackendInterceptor (DEMO ONLY: fixtures detrás del contrato HTTP)', () => {
  let client: HttpClient
  let http: HttpTestingController

  beforeEach(async () => {
    let counter = 0
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([demoBackendInterceptor])),
        provideHttpClientTesting(),
        { provide: DEMO_LATENCY_MS, useValue: 0 },
        provideDemoBackend(() => [
          {
            method: 'GET',
            path: /^\/things$/,
            respond: ({ query }) =>
              query.get('kind') === 'other'
                ? null
                : { body: [{ n: ++counter }] },
          },
          {
            method: 'POST',
            path: /^\/things\/([^/]+)$/,
            respond: ({ match, user }) =>
              match[1] === 'bad'
                ? {
                    status: 409,
                    body: { code: 'CONFLICT', message: 'Ya existe.' },
                  }
                : { status: 201, body: { id: match[1], by: user } },
          },
        ]),
      ],
    }).compileComponents()
    client = TestBed.inject(HttpClient)
    http = TestBed.inject(HttpTestingController)
    TestBed.inject(AuthService).signInDemo()
  })

  afterEach(() => http.verify())

  it('serves a matching route without reaching the network', async () => {
    const body = await firstValueFrom(client.get('/v1/things'))
    expect(body).toEqual([{ n: 1 }])
  })

  it('passes to the network what no route claims', async () => {
    const pending = firstValueFrom(client.get('/v1/things?kind=other'))
    http.expectOne('/v1/things?kind=other').flush(['real'])
    expect(await pending).toEqual(['real'])
  })

  it('answers errors with the ApiError body and the session user on writes', async () => {
    await expect(
      firstValueFrom(client.post('/v1/things/bad', {})),
    ).rejects.toMatchObject({
      status: 409,
      error: { code: 'CONFLICT' },
    })
    const ok = await firstValueFrom(client.post('/v1/things/x1', {}))
    expect(ok).toEqual({ id: 'x1', by: 'Ana' })
  })
})
