import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { NotificationService } from './notification.service'

describe('NotificationService (toasts)', () => {
  let service: NotificationService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).compileComponents()
    service = TestBed.inject(NotificationService)
  })

  it('starts empty', () => {
    expect(service.notices()).toEqual([])
  })

  it('adds a notice with kind and id', () => {
    service.notify('Documento en cuarentena', 'error')
    const notices = service.notices()
    expect(notices).toHaveLength(1)
    expect(notices[0].kind).toBe('error')
    expect(notices[0].message).toBe('Documento en cuarentena')
  })

  it('dismiss removes the notice by id', () => {
    service.notify('uno', 'info')
    service.notify('dos', 'success')
    const [first] = service.notices()
    service.dismiss(first.id)
    expect(service.notices().map((n) => n.message)).toEqual(['dos'])
  })

  it('auto-dismisses after the configured timeout', () => {
    vi.useFakeTimers()
    try {
      service.notify('efimero', 'info')
      expect(service.notices()).toHaveLength(1)
      vi.advanceTimersByTime(5000)
      expect(service.notices()).toHaveLength(0)
    } finally {
      vi.useRealTimers()
    }
  })
})
