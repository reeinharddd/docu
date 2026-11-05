import { Component, inject } from '@angular/core'
import { NotificationService } from '../../../core/services/notifications/notification.service'
import { Button } from '../../atoms/button/button'

/** Global toast stack: one instance in the shell, driven by the service. */
@Component({
  imports: [Button],
  selector: 'app-toasts',
  templateUrl: './toasts.html',
  host: {
    class: 'fixed right-4 bottom-4 z-50 flex max-w-sm flex-col gap-2',
  },
})
export class Toasts {
  private readonly notifications = inject(NotificationService)

  readonly notices = this.notifications.notices

  dismiss(id: number): void {
    this.notifications.dismiss(id)
  }
}
