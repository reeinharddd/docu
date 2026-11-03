import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { AuthService } from './auth.service'

describe('AuthService (session and permissions)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).compileComponents()
  })

  it('starts with no session and authenticated is false', () => {
    const auth = TestBed.inject(AuthService)
    auth.signOut()
    expect(auth.session()).toBeNull()
    expect(auth.authenticated()).toBe(false)
  })

  it('signInDemo creates a session with all case permissions', () => {
    const auth = TestBed.inject(AuthService)
    auth.signInDemo()
    expect(auth.authenticated()).toBe(true)
    expect(auth.can('files.upload')).toBe(true)
    expect(auth.can('quality.release')).toBe(true)
  })

  it('can rejects permissions the session lacks', () => {
    const auth = TestBed.inject(AuthService)
    auth.setSessionWithout('quality.release')
    expect(auth.can('quality.release')).toBe(false)
    expect(auth.can('files.upload')).toBe(true)
  })

  it('signOut clears the session', () => {
    const auth = TestBed.inject(AuthService)
    auth.signInDemo()
    auth.signOut()
    expect(auth.session()).toBeNull()
  })
})
