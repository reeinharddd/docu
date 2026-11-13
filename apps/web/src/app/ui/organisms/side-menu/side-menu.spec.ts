import {
  Component,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { SideMenu, type SideMenuGroup } from './side-menu'

@Component({
  selector: 'app-host',
  imports: [SideMenu],
  template: `<app-side-menu
    [groups]="groups"
    [user]="user()"
    department="Planeación"
    [compact]="compact()"
    (navigated)="navigations.set(navigations() + 1)"
    (signOut)="signOuts.set(signOuts() + 1)"
  />`,
})
class Host {
  readonly groups: SideMenuGroup[] = [
    {
      label: 'Flujo del caso',
      items: [
        { href: '/capture', label: 'Captura', icon: 'upload' },
        { href: '/inbox', label: 'Bandeja', icon: 'inbox' },
      ],
    },
    {
      label: 'Herramientas',
      items: [{ href: '/agent', label: 'Agente', icon: 'sparkles' }],
    },
  ]
  readonly user = signal<string | null>('ana')
  readonly compact = signal(false)
  readonly navigations = signal(0)
  readonly signOuts = signal(0)
}

describe('SideMenu (menú lateral por grupos)', () => {
  let el: HTMLElement
  let host: Host
  let fixture: ReturnType<typeof TestBed.createComponent<Host>>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: '**', children: [] }]),
      ],
    }).compileComponents()
    fixture = TestBed.createComponent(Host)
    host = fixture.componentInstance
    el = fixture.nativeElement as HTMLElement
    await fixture.whenStable()
  })

  it('renders each group with its links, icon and label', () => {
    const groups = el.querySelectorAll('[data-group]')
    expect(Array.from(groups).map((g) => g.getAttribute('data-group'))).toEqual(
      ['Flujo del caso', 'Herramientas'],
    )
    const inbox = el.querySelector('[data-nav="/inbox"]')
    expect(inbox?.getAttribute('href')).toBe('/inbox')
    expect(inbox?.textContent).toContain('Bandeja')
    expect(inbox?.querySelector('[data-icon="inbox"]')).toBeTruthy()
  })

  it('tells the app a link was chosen so the drawer can close', () => {
    ;(el.querySelector('[data-nav="/agent"]') as HTMLElement).click()
    expect(host.navigations()).toBe(1)
  })

  it('shows the session and signs out from the menu', () => {
    expect(el.querySelector('[data-test="session"]')?.textContent).toContain(
      'Planeación',
    )
    ;(el.querySelector('[data-test="sign-out"]') as HTMLElement).click()
    expect(host.signOuts()).toBe(1)
  })

  it('hides the session block without a user', async () => {
    host.user.set(null)
    await fixture.whenStable()
    expect(el.querySelector('[data-test="session"]')).toBeNull()
  })

  it('put away shows icons only, with the name for screen readers and on hover', async () => {
    host.compact.set(true)
    await fixture.whenStable()
    const inbox = el.querySelector('[data-nav="/inbox"]')
    expect(inbox?.getAttribute('aria-label')).toBe('Bandeja')
    expect(
      inbox?.querySelector('[data-test="tooltip"]')?.textContent,
    ).toContain('Bandeja')
    expect(el.textContent).not.toContain('FLUJO DEL CASO')
    expect(el.querySelector('[data-test="sign-out"]')).toBeTruthy()
  })
})
