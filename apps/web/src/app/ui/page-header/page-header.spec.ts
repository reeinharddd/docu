import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { StatusBadge } from '../status-badge/status-badge'
import { PageHeader } from './page-header'

describe('PageHeader', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeader],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents()
  })

  it('renders the title and the optional lead', () => {
    const fixture = TestBed.createComponent(PageHeader)
    fixture.componentRef.setInput('title', 'Bandeja')
    fixture.componentRef.setInput('lead', 'Revisa lo que entra.')
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('h1')?.textContent).toContain('Bandeja')
    expect(el.querySelector('.lead')?.textContent).toContain(
      'Revisa lo que entra.',
    )
  })

  it('omits the lead when it is not given', () => {
    const fixture = TestBed.createComponent(PageHeader)
    fixture.componentRef.setInput('title', 'Bandeja')
    fixture.detectChanges()
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.lead'),
    ).toBeNull()
  })
})

describe('StatusBadge', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadge],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents()
  })

  for (const kind of ['official', 'pending', 'quarantine', 'ai'] as const) {
    it(`renders the ${kind} class from the status tokens`, () => {
      const fixture = TestBed.createComponent(StatusBadge)
      fixture.componentRef.setInput('kind', kind)
      fixture.detectChanges()
      expect(
        (fixture.nativeElement as HTMLElement).querySelector(`.badge.${kind}`),
      ).toBeTruthy()
    })
  }
})
