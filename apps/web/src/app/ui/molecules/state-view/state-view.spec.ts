import {
  Component,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import type { ApiState } from '../../../core/types/api-state'
import { StateView } from './state-view'

@Component({
  selector: 'app-host',
  imports: [StateView],
  template: `<app-state-view [state]="state()" (retry)="retries.set(retries() + 1)">
    <p data-test="content">Ready</p>
  </app-state-view>`,
})
class Host {
  readonly state = signal<ApiState<unknown>>({ status: 'loading' })
  readonly retries = signal(0)
}

describe('StateView (the 4 states of the visual contract)', () => {
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

  it('loading shows the indicator with aria-busy and hides content', () => {
    host.state.set({ status: 'loading' })
    fixture.detectChanges()
    expect(el.querySelector('[data-test="loading"]')).toBeTruthy()
    expect(el.querySelector('[data-test="content"]')).toBeNull()
  })

  it('ready projects the content and hides the states', () => {
    host.state.set({ status: 'ready', data: [] })
    fixture.detectChanges()
    expect(el.querySelector('[data-test="content"]')?.textContent).toContain(
      'Ready',
    )
    expect(el.querySelector('[data-test="loading"]')).toBeNull()
  })

  it('empty shows the empty message, not the content', () => {
    host.state.set({ status: 'empty' })
    fixture.detectChanges()
    expect(el.querySelector('[data-test="empty"]')?.textContent).toContain(
      'Sin registros',
    )
  })

  it('error shows the message and allows retry', () => {
    host.state.set({ status: 'error', message: 'No se pudo consultar la API.' })
    fixture.detectChanges()
    expect(el.querySelector('[data-test="error"]')?.textContent).toContain(
      'No se pudo consultar',
    )
    ;(el.querySelector('[data-test="retry"]') as HTMLElement).click()
    expect(host.retries()).toBe(1)
  })
})
