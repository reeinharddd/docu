import { Component, computed, input } from '@angular/core'
import { Icon } from '../icon/icon'
import type { IconName } from '../icon/icon-paths'

export type StatusKind = 'official' | 'pending' | 'quarantine' | 'ai'

const ICONS: Record<StatusKind, IconName> = {
  official: 'check',
  pending: 'clock',
  quarantine: 'triangle-alert',
  ai: 'sparkles',
}

/**
 * Domain status badge (design system §9.3): the four states a document can
 * be in. The colors come from the status tokens, so a color always means
 * the same thing (MARCA.md). Always icon + word, never color alone (§8).
 */
@Component({
  imports: [Icon],
  selector: 'app-status-badge',
  templateUrl: './status-badge.html',
  host: { class: 'inline-flex' },
})
export class StatusBadge {
  readonly kind = input.required<StatusKind>()
  /** Optional icon override (e.g. octagon-x for a blocking rule). */
  readonly icon = input<IconName | null>(null)

  readonly iconName = computed(() => this.icon() ?? ICONS[this.kind()])
}
