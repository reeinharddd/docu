import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { App } from './app'
import { routes } from './app.routes'

describe('App (plataforma shell)', () => {
  beforeEach(async () => {
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
    const wordmark = el.querySelector('.wordmark')
    expect(wordmark?.textContent).toContain('docu')
    expect(el.querySelector('.wordmark-u')).toBeTruthy()
  })

  it('navigates with the 4 case routes', async () => {
    const fixture = TestBed.createComponent(App)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    const links = Array.from(el.querySelectorAll('nav a'))
    const rutas = links.map((a) => a.getAttribute('href'))
    expect(rutas).toEqual(['/capture', '/inbox', '/schedule', '/search'])
  })
})
