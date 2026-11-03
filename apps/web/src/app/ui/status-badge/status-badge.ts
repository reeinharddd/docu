import { Component, input } from '@angular/core'

export type StatusKind = 'official' | 'pending' | 'quarantine' | 'ai'

/**
 * Domain status badge: the four states a document can be in. The colors come
 * from the status tokens, so a color always means the same thing (MARCA.md).
 */
@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
})
export class StatusBadge {
  readonly kind = input.required<StatusKind>()
}
