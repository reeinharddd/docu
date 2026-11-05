import { TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { appConfig } from './app.config'
import { routes } from './app.routes'
import { AuthService } from './core/services/auth/auth.service'

describe('Guards and permissions (RBAC from ROLES.md)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideRouter(routes)],
    }).compileComponents()
  })

  it('without a session, a protected route redirects to /login', async () => {
    TestBed.inject(AuthService).signOut()
    const harness = await RouterTestingHarness.create()
    await harness.navigateByUrl('/inbox')
    expect(TestBed.inject(Router).url).toBe('/login')
  })

  it('with a session and the permission, the protected route renders', async () => {
    TestBed.inject(AuthService).signInDemo()
    const harness = await RouterTestingHarness.create()
    await harness.navigateByUrl('/inbox')
    expect(TestBed.inject(Router).url).toBe('/inbox')
  })

  it('without the specific permission, redirects to /forbidden', async () => {
    TestBed.inject(AuthService).setSessionWithout('inbox.review')
    const harness = await RouterTestingHarness.create()
    await harness.navigateByUrl('/inbox')
    expect(TestBed.inject(Router).url).toBe('/forbidden')
  })

  it('public routes login and forbidden need no session', async () => {
    TestBed.inject(AuthService).signOut()
    const harness = await RouterTestingHarness.create()
    await harness.navigateByUrl('/login')
    expect(TestBed.inject(Router).url).toBe('/login')
    await harness.navigateByUrl('/forbidden')
    expect(TestBed.inject(Router).url).toBe('/forbidden')
  })

  it('an unknown route redirects to capture (wildcard)', async () => {
    TestBed.inject(AuthService).signInDemo()
    const harness = await RouterTestingHarness.create()
    await harness.navigateByUrl('/no-existe')
    expect(TestBed.inject(Router).url).toBe('/capture')
  })
})
