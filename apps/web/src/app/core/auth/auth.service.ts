import { computed, Injectable, signal } from '@angular/core'
import { DEMO_PERMISSIONS, type Permission, type Session } from './permissions'

/**
 * Session state backed by signals. Today it holds a clearly marked demo
 * session: when POST /v1/auth/login exists (#12), signInDemo() is replaced
 * by the real call and the token flows through authInterceptor — screens
 * never change. Everything here is transient: the real session is dynamic,
 * served by the backend.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _session = signal<Session | null>(null)

  readonly session = this._session.asReadonly()
  readonly authenticated = computed(() => this._session() !== null)

  can(permission: Permission): boolean {
    return this._session()?.permissions.includes(permission) ?? false
  }

  /** DEMO ONLY — remove when #12 lands. Full-permission demo session. */
  signInDemo(): void {
    this._session.set({
      user: 'ana',
      department: 'planeacion',
      token: null,
      permissions: [...DEMO_PERMISSIONS],
    })
  }

  /** Test helper: full demo session minus one permission. */
  setSessionWithout(permission: Permission): void {
    this._session.set({
      user: 'ana',
      department: 'planeacion',
      token: null,
      permissions: DEMO_PERMISSIONS.filter((p) => p !== permission),
    })
  }

  /** Test helper: demo session carrying a token (interceptor tests). */
  setSessionWithToken(token: string): void {
    const current = this._session()
    this._session.set({
      user: current?.user ?? 'ana',
      department: current?.department ?? 'planeacion',
      token,
      permissions: current?.permissions ?? [...DEMO_PERMISSIONS],
    })
  }

  signOut(): void {
    this._session.set(null)
  }
}
