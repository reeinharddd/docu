import { Component, computed, DestroyRef, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { RouterLink } from '@angular/router'
import { DocuDatePipe, DocuNumberPipe } from '../../../core/format/format'
import { ApiClient } from '../../../core/services/api/api-client'
import { NotificationService } from '../../../core/services/notifications/notification.service'
import type { ApiState } from '../../../core/types/api-state'
import { Button, ButtonLink } from '../../../ui/atoms/button/button'
import { FamilyTag } from '../../../ui/atoms/family-tag/family-tag'
import { Icon } from '../../../ui/atoms/icon/icon'
import { RuleTag } from '../../../ui/atoms/rule-tag/rule-tag'
import { StatusBadge } from '../../../ui/atoms/status-badge/status-badge'
import { PageHeader } from '../../../ui/molecules/page-header/page-header'
import { StateView } from '../../../ui/molecules/state-view/state-view'
import type { DayReport, ReportGroup, ReportItem } from '../model/reports'

/** Day of the incident in the C1 dataset (G6). */
export const DEFAULT_DAY = '2026-10-26'

const GROUPS: ReadonlyArray<{ id: ReportGroup; label: string }> = [
  { id: 'production', label: 'Producción' },
  { id: 'scrap', label: 'Merma' },
  { id: 'downtime', label: 'Paros' },
  { id: 'blocks', label: 'Bloqueos y riesgos' },
]

/**
 * Day report (F6 · G6). It is not assembled by hand: every number comes
 * from linked official data and cites its origin; the alert fires when a
 * metric crosses its threshold, and an R-P4 change pauses a stale report
 * (RF-05). The endpoint arrives with #39; until then, the local fixture.
 */
@Component({
  imports: [
    Button,
    ButtonLink,
    DocuDatePipe,
    DocuNumberPipe,
    FamilyTag,
    Icon,
    PageHeader,
    RouterLink,
    RuleTag,
    StateView,
    StatusBadge,
  ],
  selector: 'app-reports',
  templateUrl: './reports-view.html',
})
export class ReportsView {
  private readonly api = inject(ApiClient)
  private readonly notifications = inject(NotificationService)
  private readonly destroyRef = inject(DestroyRef)

  readonly day = signal(DEFAULT_DAY)
  readonly report = signal<ApiState<DayReport>>({ status: 'loading' })

  /** A day without confirmed data is empty, not an error. */
  readonly view = computed<ApiState<DayReport>>(() => {
    const r = this.report()
    return r.status === 'ready' && r.data.items.length === 0
      ? { status: 'empty' }
      : r
  })

  readonly groups = computed(() => {
    const r = this.report()
    if (r.status !== 'ready') return []
    return GROUPS.map((g) => ({
      ...g,
      items: r.data.items.filter((i) => i.group === g.id),
    })).filter((g) => g.items.length > 0)
  })

  constructor() {
    this.load()
  }

  load(): void {
    this.api
      .get<DayReport>(`/reports/day?date=${this.day()}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((s) => this.report.set(s))
  }

  onDayChange(value: string): void {
    if (!value) return
    this.day.set(value)
    this.load()
  }

  /** CSV with the citation of every number: the report travels with its origin. */
  download(): void {
    const r = this.report()
    if (r.status !== 'ready') return
    const rows = [
      [
        'Grupo',
        'Dato',
        'Máquina',
        'Valor',
        'Unidad',
        'Estado',
        'Archivo',
        'Documento',
        'Regla',
      ],
      ...r.data.items.map((i: ReportItem) => [
        GROUPS.find((g) => g.id === i.group)?.label ?? i.group,
        i.label,
        i.machine ?? '',
        String(i.value),
        i.unit,
        i.status === 'official' ? 'Oficial' : 'Pendiente',
        i.source.fileName,
        i.source.documentId,
        i.ruleCode ?? '',
      ]),
    ]
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','),
      )
      .join('\n')
    const url = URL.createObjectURL(
      new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte-${r.data.date}.csv`
    link.click()
    URL.revokeObjectURL(url)
    this.notifications.notify(
      'Reporte descargado con el origen de cada cifra.',
      'success',
    )
  }
}
