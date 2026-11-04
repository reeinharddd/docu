import { Component, inject } from '@angular/core'
import { NotificationService } from '../../core/notifications/notification.service'

/** Global toast stack: one instance in the shell, driven by the service. */
@Component({
  selector: 'app-toasts',
  templateUrl: './toasts.html',
  styleUrl: './toasts.css',
})
export class Toasts {
  private readonly notifications = inject(NotificationService)

  readonly notices = this.notifications.notices

  dismiss(id: number): void {
    this.notifications.dismiss(id)
  }
}
