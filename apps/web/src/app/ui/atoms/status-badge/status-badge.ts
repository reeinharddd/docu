import { Component, input } from '@angular/core'

export type StatusKind = 'official' | 'pending' | 'quarantine' | 'ai'

/**
 * Domain status badge (design system §9.3): the four states a document can
 * be in. The colors come from the status tokens, so a color always means
 * the same thing (MARCA.md).
 */
@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.html',
  host: { class: 'inline-flex' },
})
export class StatusBadge {
  readonly kind = input.required<StatusKind>()
}
