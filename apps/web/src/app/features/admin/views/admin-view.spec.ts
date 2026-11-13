import { provideZonelessChangeDetection } from '@angular/core'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { AdminView } from './admin-view'

describe('AdminView (maqueta del panel global por instalación)', () => {
  let fixture: ComponentFixture<AdminView>
  let el: HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminView],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents()
    fixture = TestBed.createComponent(AdminView)
    el = fixture.nativeElement as HTMLElement
    await fixture.whenStable()
  })

  it('shows the installations and the team modules', () => {
    expect(el.textContent).toContain('Configuración 1')
    expect(el.textContent).toContain('Configuración 2')
    expect(el.textContent).toContain('Kira Llizara Garfias González')
  })

  it('toggles a feature only for the selected installation', async () => {
    const view = fixture.componentInstance
    view.current.set('c2')
    view.toggle('agent')
    await fixture.whenStable()
    const agent = view.features().find((f) => f.id === 'agent')
    expect(agent?.enabled.c2).toBe(true)
    expect(agent?.enabled.c1).toBe(true)
    view.toggle('capture')
    expect(view.features().find((f) => f.id === 'capture')?.enabled.c2).toBe(
      false,
    )
    expect(view.features().find((f) => f.id === 'capture')?.enabled.c1).toBe(
      true,
    )
  })
})
