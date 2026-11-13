import {
  Component,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import {
  Button,
  ButtonLink,
  type ButtonSize,
  type ButtonVariant,
} from './button'

@Component({
  selector: 'app-host',
  imports: [Button],
  template: `<app-button
    [variant]="variant()"
    [size]="size()"
    [type]="type()"
    [disabled]="disabled()"
    [loading]="loading()"
    [ariaLabel]="ariaLabel()"
  >
    Confirmar
  </app-button>`,
})
class Host {
  readonly variant = signal<ButtonVariant>('primary')
  readonly size = signal<ButtonSize>('md')
  readonly type = signal<'button' | 'submit'>('button')
  readonly disabled = signal(false)
  readonly loading = signal(false)
  readonly ariaLabel = signal<string | null>(null)
}

describe('Button (atomic UI component)', () => {
  let host: Host
  let el: HTMLElement
  let fixture: ReturnType<typeof TestBed.createComponent<Host>>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents()
    fixture = TestBed.createComponent(Host)
    host = fixture.componentInstance
    el = fixture.nativeElement as HTMLElement
  })

  function nativeButton(): HTMLButtonElement {
    return el.querySelector('button') as HTMLButtonElement
  }

  it('renders a native button with the projected label', () => {
    fixture.detectChanges()
    expect(nativeButton().textContent).toContain('Confirmar')
  })

  it('defaults to the primary variant in the md size', () => {
    fixture.detectChanges()
    expect(nativeButton().getAttribute('data-variant')).toBe('primary')
    expect(nativeButton().getAttribute('data-size')).toBe('md')
  })

  it('applies the variant that the screen asks for', () => {
    host.variant.set('secondary')
    fixture.detectChanges()
    expect(nativeButton().getAttribute('data-variant')).toBe('secondary')
  })

  it('supports the danger variant for destructive actions', () => {
    host.variant.set('danger')
    fixture.detectChanges()
    expect(nativeButton().getAttribute('data-variant')).toBe('danger')
  })

  it('supports the lg size', () => {
    host.size.set('lg')
    fixture.detectChanges()
    expect(nativeButton().getAttribute('data-size')).toBe('lg')
  })

  it('sets the native type so a submit button stays a submit button', () => {
    host.type.set('submit')
    fixture.detectChanges()
    expect(nativeButton().getAttribute('type')).toBe('submit')
  })

  it('disables the native button when the screen disables it', () => {
    host.disabled.set(true)
    fixture.detectChanges()
    expect(nativeButton().disabled).toBe(true)
  })

  it('marks itself busy and disabled while loading', () => {
    host.loading.set(true)
    fixture.detectChanges()
    expect(nativeButton().getAttribute('aria-busy')).toBe('true')
    expect(nativeButton().disabled).toBe(true)
  })

  it('exposes the accessible name for icon-only buttons', () => {
    host.ariaLabel.set('Cerrar aviso')
    fixture.detectChanges()
    expect(nativeButton().getAttribute('aria-label')).toBe('Cerrar aviso')
  })
})

@Component({
  selector: 'app-link-host',
  imports: [ButtonLink],
  template: `<a appButtonLink variant="primary" href="/inbox">Ir</a>`,
})
class LinkHost {}

describe('ButtonLink (the button look on a navigation link)', () => {
  it('keeps the native link and takes the variant styles', async () => {
    await TestBed.configureTestingModule({
      imports: [LinkHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents()
    const fixture = TestBed.createComponent(LinkHost)
    fixture.detectChanges()
    const link = (fixture.nativeElement as HTMLElement).querySelector('a')
    expect(link?.getAttribute('href')).toBe('/inbox')
    expect(link?.getAttribute('data-variant')).toBe('primary')
    expect(link?.className).toContain('min-h-11')
  })
})
