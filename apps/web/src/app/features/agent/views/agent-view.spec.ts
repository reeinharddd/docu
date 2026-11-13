import { provideZonelessChangeDetection } from '@angular/core'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { AgentView } from './agent-view'

describe('AgentView (maqueta del agente: responde con fuentes, nunca publica)', () => {
  let fixture: ComponentFixture<AgentView>
  let el: HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentView],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents()
    fixture = TestBed.createComponent(AgentView)
    el = fixture.nativeElement as HTMLElement
    await fixture.whenStable()
  })

  it('greets and says it does not publish official data (ADR-0006)', () => {
    expect(el.querySelector('[data-test="msg-agent"]')?.textContent).toContain(
      'No publico datos oficiales',
    )
  })

  it('answers a question with sources and actions, marked as AI', async () => {
    fixture.componentInstance.ask('¿Qué órdenes dependen del rollo R-017?')
    await fixture.whenStable()
    expect(el.querySelector('[data-test="msg-user"]')?.textContent).toContain(
      'R-017',
    )
    expect(el.textContent).toContain('Consultando datos oficiales')

    await new Promise((resolve) => setTimeout(resolve, 1000))
    await fixture.whenStable()
    const answers = el.querySelectorAll('[data-test="msg-agent"]')
    const last = answers[answers.length - 1]
    expect(last?.textContent).toContain('ORD-2026-0042')
    expect(last?.textContent).toContain('recepcion-sab-24oct.xlsx')
    expect(last?.querySelector('[data-kind="ai"]')).toBeTruthy()
    expect(
      Array.from(last?.querySelectorAll('a') ?? []).some(
        (a) => a.getAttribute('href') === '/search?q=R-017',
      ),
    ).toBe(true)
  })

  it('ignores an empty question', async () => {
    fixture.componentInstance.ask('   ')
    await fixture.whenStable()
    expect(el.querySelectorAll('[data-test="msg-user"]').length).toBe(0)
  })
})
