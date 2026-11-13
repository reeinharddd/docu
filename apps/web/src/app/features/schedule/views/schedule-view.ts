import { Component, computed, DestroyRef, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { RouterLink } from '@angular/router'
import { DocuDatePipe, DocuNumberPipe } from '../../../core/format/format'
import { ApiClient } from '../../../core/services/api/api-client'
import { NotificationService } from '../../../core/services/notifications/notification.service'
import type { ApiError } from '../../../core/types/api-error'
import type { ApiState } from '../../../core/types/api-state'
import { Button } from '../../../ui/atoms/button/button'
import { FamilyTag } from '../../../ui/atoms/family-tag/family-tag'
import { Icon } from '../../../ui/atoms/icon/icon'
import { RuleTag } from '../../../ui/atoms/rule-tag/rule-tag'
import {
  StatusBadge,
  type StatusKind,
} from '../../../ui/atoms/status-badge/status-badge'
import { PageHeader } from '../../../ui/molecules/page-header/page-header'
import { StateView } from '../../../ui/molecules/state-view/state-view'
import type {
  RollState,
  ScheduleEntry,
  SyncAccepted,
  WeekSchedule,
} from '../model/schedule'

/** Week of the case (dataset C1, incident on Monday 26-oct). */
export const DEFAULT_WEEK = '2026-10-26'
const SAP_SOURCE = 'sap'

const STATE_BADGE: Record<RollState, { kind: StatusKind; label: string }> = {
  assignable: { kind: 'official', label: 'Asignable' },
  blocked: { kind: 'quarantine', label: 'No asignable' },
  committed: { kind: 'pending', label: 'Comprometido' },
  replan: { kind: 'pending', label: 'Replan' },
}

export interface DayGroup {
  day: string
  entries: ScheduleEntry[]
}

/**
 * Weekly program (F1, F5, F7 · G4). Each row shows its live blocks next to
 * it, so Ana sees on Monday at 06:00 what cannot run and why, and jumps to
 * the reason (Bandeja) or to the trace (Búsqueda).
 */
@Component({
  imports: [
    Button,
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
  selector: 'app-schedule',
  templateUrl: './schedule-view.html',
})
export class ScheduleView {
  private readonly api = inject(ApiClient)
  private readonly notifications = inject(NotificationService)
  private readonly destroyRef = inject(DestroyRef)

  protected readonly badge = STATE_BADGE

  readonly week = signal(DEFAULT_WEEK)
  readonly schedule = signal<ApiState<WeekSchedule>>({ status: 'loading' })
  readonly syncing = signal(false)

  /** An official program with no rows is an empty week, not an error. */
  readonly view = computed<ApiState<WeekSchedule>>(() => {
    const s = this.schedule()
    return s.status === 'ready' && s.data.entries.length === 0
      ? { status: 'empty' }
      : s
  })

  readonly days = computed<DayGroup[]>(() => {
    const s = this.schedule()
    if (s.status !== 'ready') return []
    const groups = new Map<string, ScheduleEntry[]>()
    for (const e of s.data.entries) {
      groups.set(e.day, [...(groups.get(e.day) ?? []), e])
    }
    return [...groups].map(([day, entries]) => ({ day, entries }))
  })

  readonly summary = computed(() => {
    const s = this.schedule()
    const entries = s.status === 'ready' ? s.data.entries : []
    return {
      total: entries.length,
      blocked: entries.filter((e) => e.state === 'blocked').length,
      replan: entries.filter((e) => e.state === 'replan').length,
      assignable: entries.filter((e) => e.state === 'assignable').length,
    }
  })

  constructor() {
    this.load()
  }

  load(): void {
    this.api
      .get<WeekSchedule>(
        `/official-records?type=production_schedule&week=${this.week()}`,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((s) => this.schedule.set(s))
  }

  shiftWeek(days: number): void {
    const d = new Date(`${this.week()}T12:00:00Z`)
    d.setUTCDate(d.getUTCDate() + days)
    this.week.set(d.toISOString().slice(0, 10))
    this.load()
  }

  sync(): void {
    this.syncing.set(true)
    this.api
      .post<SyncAccepted>(`/sources/${SAP_SOURCE}/sync`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.syncing.set(false)
          this.notifications.notify(
            'Sincronización con SAP en curso; el programa se actualiza al terminar.',
            'info',
          )
        },
        error: (error: ApiError) => {
          this.syncing.set(false)
          this.notifications.notify(error.message, 'error')
        },
      })
  }
}
