import { Component, computed, input, output } from '@angular/core'
import type { ApiState } from '../../../core/types/api-state'
import { Button } from '../../atoms/button/button'

/**
 * The visual contract: every screen renders its ApiState through this
 * component, so loading/empty/error look and behave the same everywhere.
 * Ready state projects the screen's own content.
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

  readonly message = computed(() => {
    const s = this.state()
    return s.status === 'error' ? s.message : ''
  })
}
