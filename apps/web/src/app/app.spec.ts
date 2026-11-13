import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { App } from './app'
import { routes } from './app.routes'
import { AuthService } from './core/services/auth/auth.service'

describe('App (plataforma shell)', () => {
  beforeEach(async () => {
    localStorage.removeItem('docu.sideMenu.collapsed')
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideZonelessChangeDetection(), provideRouter(routes)],
    }).compileComponents()
  })

  it('creates the app', () => {
    const fixture = TestBed.createComponent(App)
    expect(fixture.componentInstance).toBeTruthy()
  })

  it('shows the docu wordmark with the accented u', async () => {
    const fixture = TestBed.createComponent(App)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    const wordmark = el.querySelector('[data-test="wordmark"]')
    expect(wordmark?.textContent).toContain('docu')
    expect(el.querySelector('[data-test="wordmark-accent"]')).toBeTruthy()
  })

  it('navigates with the case screens the session can open', async () => {
    TestBed.inject(AuthService).signInDemo()
    const fixture = TestBed.createComponent(App)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    const links = Array.from(el.querySelectorAll('#main-nav a'))
    const rutas = links.map((a) => a.getAttribute('href'))
    expect(rutas).toEqual([
      '/capture',
      '/inbox',
      '/schedule',
      '/search',
      '/reports',
      '/agent',
      '/apis',
      '/admin',
    ])
  })

  it('hides the screens a role cannot open', async () => {
    TestBed.inject(AuthService).setSessionWithout('reports.view')
    const fixture = TestBed.createComponent(App)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    const rutas = Array.from(el.querySelectorAll('#main-nav a')).map((a) =>
      a.getAttribute('href'),
    )
    expect(rutas).not.toContain('/reports')
  })

  it('shows no navigation without a session', async () => {
    TestBed.inject(AuthService).signOut()
    const fixture = TestBed.createComponent(App)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelectorAll('#main-nav a').length).toBe(0)
    expect(el.querySelector('[data-test="menu-toggle"]')).toBeNull()
  })

  it('points the wordmark to the capture route', async () => {
    const fixture = TestBed.createComponent(App)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    const wordmark = el.querySelector('[data-test="wordmark"]')
    expect(wordmark?.getAttribute('href')).toBe('/capture')
  })

  it('opens the side menu as a drawer and closes it with Escape', async () => {
    TestBed.inject(AuthService).signInDemo()
    const fixture = TestBed.createComponent(App)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('[data-test="mobile-nav"]')).toBeNull()

    ;(el.querySelector('[data-test="menu-toggle"]') as HTMLElement).click()
    await fixture.whenStable()
    expect(el.querySelector('[data-test="mobile-nav"]')).toBeTruthy()
    expect(
      el
        .querySelector('[data-test="menu-toggle"]')
        ?.getAttribute('aria-expanded'),
    ).toBe('true')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await fixture.whenStable()
    expect(el.querySelector('[data-test="mobile-nav"]')).toBeNull()
  })

  it('groups the screens: the case flow first, then the tools', async () => {
    TestBed.inject(AuthService).signInDemo()
    const fixture = TestBed.createComponent(App)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    const groups = Array.from(
      el.querySelectorAll('#main-nav [data-group]'),
    ).map((g) => g.getAttribute('data-group'))
    expect(groups).toEqual(['Flujo del caso', 'Herramientas'])
  })

  it('signs out from the menu and returns to /login', async () => {
    const auth = TestBed.inject(AuthService)
    auth.signInDemo()
    const fixture = TestBed.createComponent(App)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    ;(
      el.querySelector('#main-nav [data-test="sign-out"]') as HTMLElement
    ).click()
    await fixture.whenStable()
    expect(auth.authenticated()).toBe(false)
  })

  it('puts the side menu away and remembers it', async () => {
    TestBed.inject(AuthService).signInDemo()
    const fixture = TestBed.createComponent(App)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    const rail = () => el.querySelector('[data-test="side-rail"]')
    const toggle = () =>
      el.querySelector('[data-test="collapse-toggle"]') as HTMLElement

    expect(rail()?.getAttribute('data-collapsed')).toBe('false')
    expect(toggle().getAttribute('aria-label')).toBe('Guardar menú lateral')
    toggle().click()
    await fixture.whenStable()
    expect(rail()?.getAttribute('data-collapsed')).toBe('true')
    expect(toggle().getAttribute('aria-label')).toBe('Abrir menú lateral')
    expect(localStorage.getItem('docu.sideMenu.collapsed')).toBe('1')

    const again = TestBed.createComponent(App)
    await again.whenStable()
    expect(
      (again.nativeElement as HTMLElement)
        .querySelector('[data-test="side-rail"]')
        ?.getAttribute('data-collapsed'),
    ).toBe('true')
  })
})
