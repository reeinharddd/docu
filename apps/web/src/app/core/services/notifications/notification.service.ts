import { Injectable, InjectionToken, inject, signal } from '@angular/core'

export type NoticeKind = 'success' | 'error' | 'warning' | 'info'

export interface Notice {
  id: number
  kind: NoticeKind
  message: string
}

/**
 * How long a toast stays on screen (ms). Inject a different value in tests.
 */
export const NOTICE_AUTO_DISMISS_MS = new InjectionToken<number>(
  'NOTICE_AUTO_DISMISS_MS',
  { factory: () => 5000 },
)

/**
 * UI notifications (toasts), kept out of the ApiState contract on purpose:
 * notifications are about ACTIONS the user took (upload confirmed, rule
 * blocked), while ApiState is about a READ. The backend does not send
 * toasts in C1; when alerts land (#39) they arrive as data, not as toasts.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly autoDismissMs = inject(NOTICE_AUTO_DISMISS_MS)
  private readonly _notices = signal<Notice[]>([])
  private nextId = 1

  readonly notices = this._notices.asReadonly()

  notify(message: string, kind: NoticeKind = 'info'): void {
    const notice: Notice = { id: this.nextId++, kind, message }
    this._notices.update((all) => [...all, notice])
    setTimeout(() => this.dismiss(notice.id), this.autoDismissMs)
  }

  dismiss(id: number): void {
    this._notices.update((all) => all.filter((n) => n.id !== id))
  }
}
