import { Component, computed, input } from '@angular/core'
import { RULES, type RuleCode } from '../../../core/types/catalog'
import { Icon } from '../icon/icon'

/**
 * Validation rule tag (CATEGORIAS.md §3): mono code + short phrase, with
 * the severity written out. Bloqueo uses the quarantine tokens, Aviso the
 * pending ones; both always carry the word, never color alone.
 */
@Component({
  imports: [Icon],
  selector: 'app-rule-tag',
  template: `<span
    class="inline-flex flex-wrap items-center gap-x-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
    [class.bg-quarantine-bg]="isBlock()"
    [class.text-quarantine]="isBlock()"
    [class.bg-pending-bg]="!isBlock()"
    [class.text-pending]="!isBlock()"
    [attr.data-rule]="code()"
    [attr.data-severity]="info().severity"
    [attr.title]="info().reason"
  >
    <app-icon [name]="isBlock() ? 'octagon-x' : 'triangle-alert'" [size]="16" />
    <span class="whitespace-nowrap">{{ isBlock() ? 'Bloqueo' : 'Aviso' }} ·</span>
    <span class="whitespace-nowrap font-mono">{{ code() }}</span>
    <span class="whitespace-nowrap">{{ info().short }}</span>
  </span>`,
  host: { class: 'inline-flex' },
})
export class RuleTag {
  readonly code = input.required<RuleCode>()

  readonly info = computed(() => RULES[this.code()])
  readonly isBlock = computed(() => this.info().severity === 'block')
}
