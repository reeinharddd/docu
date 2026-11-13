import { Component, computed, input, output } from '@angular/core'
import type { ApiState } from '../../../core/types/api-state'
import { Button } from '../../atoms/button/button'

/**
 * The visual contract: every screen renders its ApiState through this
 * component, so loading/empty/error look and behave the same everywhere.
 * Ready state projects the screen's own content; an element marked
 * `stateEmptyAction` is projected as the empty state's call to action.
 */
@Component({
  imports: [Button],
  selector: 'app-state-view',
  templateUrl: './state-view.html',
  host: { class: 'block w-full' },
})
export class StateView<T> {
  readonly state = input.required<ApiState<T>>()
  readonly retry = output<void>()
  /** Empty state invites to act (design system §8): per-screen text. */
  readonly emptyTitle = input('Sin registros por ahora.')
  readonly emptyHint = input('Cuando haya datos confirmados, aparecen aquí.')

  readonly message = computed(() => {
    const s = this.state()
    return s.status === 'error' ? s.message : ''
  })
}
