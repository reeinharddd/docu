import { provideZonelessChangeDetection } from '@angular/core'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { ApisView } from './apis-view'

describe('ApisView (maqueta de la consola de APIs)', () => {
  let fixture: ComponentFixture<ApisView>
  let el: HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApisView],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents()
    fixture = TestBed.createComponent(ApisView)
    el = fixture.nativeElement as HTMLElement
    await fixture.whenStable()
  })

  it('lists the contract endpoints and says it is a mock-up', () => {
    expect(el.textContent).toContain('/v1/files')
    expect(el.textContent).toContain('/health')
    expect(el.textContent).toContain('Maqueta de demostración')
  })

  it('never shows a full key and can revoke one', async () => {
    expect(el.textContent).toContain('docu_live_7f3a••••')
    fixture.componentInstance.revoke('k1')
    await fixture.whenStable()
    expect(
      fixture.componentInstance.keys().find((k) => k.id === 'k1')?.active,
    ).toBe(false)
  })
})
