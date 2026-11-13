import { Component, computed, input } from '@angular/core'
import { ICON_SHAPES, type IconName } from './icon-paths'

/**
 * Decorative icon (design system §7): 2px stroke, currentColor. Always next
 * to a word, so it is aria-hidden; an icon never carries meaning alone.
 */
@Component({
  selector: 'app-icon',
  templateUrl: './icon.html',
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
})
export class Icon {
  readonly name = input.required<IconName>()
  readonly size = input<16 | 20 | 24>(20)

  readonly shapes = computed(() => ICON_SHAPES[this.name()])
}
