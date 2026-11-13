import { Component, computed, input } from '@angular/core'
import {
  FAMILY_LABELS,
  type FamilyCode,
  UNCLASSIFIED_LABEL,
} from '../../../core/types/catalog'
import { Icon } from '../icon/icon'
import type { IconName } from '../icon/icon-paths'

const FAMILY_ICONS: Record<FamilyCode, IconName> = {
  programa_planeacion: 'calendar',
  recepcion_rollo: 'package',
  inventario: 'layers',
  excel_turno: 'clipboard-list',
  correo_hermana: 'mail',
  escaneado: 'scan-line',
}

/**
 * File family tag (CATEGORIAS.md §1): neutral brand tag, distinguished by
 * icon + label, never by color, so status colors keep their meaning. The
 * slug stays in the title for the technical detail.
 */
@Component({
  imports: [Icon],
  selector: 'app-family-tag',
  template: `<span
    class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-line bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-text"
    [attr.data-family]="family() ?? 'unclassified'"
    [attr.title]="family() ?? null"
  >
    <app-icon [name]="icon()" [size]="16" />
    {{ label() }}
  </span>`,
  host: { class: 'inline-flex' },
})
export class FamilyTag {
  readonly family = input.required<FamilyCode | null>()

  readonly label = computed(() => {
    const f = this.family()
    return f ? FAMILY_LABELS[f] : UNCLASSIFIED_LABEL
  })

  readonly icon = computed<IconName>(() => {
    const f = this.family()
    return f ? FAMILY_ICONS[f] : 'file-question'
  })
}
