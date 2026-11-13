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
import { provideRouter, Router } from '@angular/router'
import { routes } from '../../../app.routes'
import { API_BASE_URL } from '../../config/api-url'
import { AuthService } from '../../services/auth/auth.service'
import { apiInterceptors } from './interceptors'

describe('HTTP coordination interceptors', () => {
  let client: HttpClient
  let http: HttpTestingController
  let router: Router
  let auth: AuthService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([...apiInterceptors])),
        provideHttpClientTesting(),
        provideRouter(routes),
      ],
    }).compileComponents()
    client = TestBed.inject(HttpClient)
    http = TestBed.inject(HttpTestingController)
    router = TestBed.inject(Router)
    auth = TestBed.inject(AuthService)
    auth.signInDemo()
  })

  afterEach(() => http.verify())

  it('prepends the central API base to relative paths', () => {
    client.get('/quarantine').subscribe({ error: () => {} })
    http.expectOne(`${TestBed.inject(API_BASE_URL)}/quarantine`).flush([])
  })

  it('does not prefix twice a path that already carries the base', () => {
    client.get('/v1/quarantine').subscribe({ error: () => {} })
    http.expectOne('/v1/quarantine').flush([])
  })

  it('attaches the bearer token when the session has one', () => {
    const token = 'jwt-de-prueba'
    auth.setSessionWithToken(token)
    client.get('/quarantine').subscribe({ error: () => {} })
    const req = http.expectOne('/v1/quarantine')
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`)
    req.flush([])
  })

  it('sends no authorization header without a token', () => {
    auth.signInDemo()
    client.get('/quarantine').subscribe({ error: () => {} })
    const req = http.expectOne('/v1/quarantine')
    expect(req.request.headers.get('Authorization')).toBeNull()
    req.flush([])
  })

  it('on 401 (outside login) clears the session and redirects to /login', async () => {
    auth.signInDemo()
    client.get('/inbox').subscribe({ error: () => {} })
    http
      .expectOne('/v1/inbox')
      .flush(
        { code: 'UNAUTHENTICATED' },
        { status: 401, statusText: 'Unauthorized' },
      )
    await vi.waitFor(() => expect(router.url.startsWith('/login')).toBe(true))
    expect(auth.session()).toBeNull()
  })

  it('on 401 from the login endpoint, does not redirect', async () => {
    auth.signInDemo()
    client.post('/auth/login', {}).subscribe({ error: () => {} })
    http
      .expectOne('/v1/auth/login')
      .flush(
        { code: 'UNAUTHENTICATED' },
        { status: 401, statusText: 'Unauthorized' },
      )
    await new Promise((r) => setTimeout(r, 0))
    expect(auth.session()).not.toBeNull()
  })

  it('on 403 redirects to /forbidden', async () => {
    auth.signInDemo()
    client.get('/reports/day').subscribe({ error: () => {} })
    http
      .expectOne('/v1/reports/day')
      .flush({ code: 'FORBIDDEN' }, { status: 403, statusText: 'Forbidden' })
    await vi.waitFor(() => expect(router.url).toBe('/forbidden'))
  })
})
