import { NgTemplateOutlet } from '@angular/common'
import { Component, computed, DestroyRef, inject, signal } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { map } from 'rxjs'
import { DocuDatePipe } from '../../../core/format/format'
import { ApiClient } from '../../../core/services/api/api-client'
import { AuthService } from '../../../core/services/auth/auth.service'
import { NotificationService } from '../../../core/services/notifications/notification.service'
import type { ApiError } from '../../../core/types/api-error'
import type { ApiState } from '../../../core/types/api-state'
import {
  FAMILY_CODES,
  FAMILY_LABELS,
  type FamilyCode,
  isRuleCode,
  RULE_CODES,
  RULES,
} from '../../../core/types/catalog'
import { Button, ButtonLink } from '../../../ui/atoms/button/button'
import { FamilyTag } from '../../../ui/atoms/family-tag/family-tag'
import { Icon } from '../../../ui/atoms/icon/icon'
import { RuleTag } from '../../../ui/atoms/rule-tag/rule-tag'
import { StatusBadge } from '../../../ui/atoms/status-badge/status-badge'
import { PageHeader } from '../../../ui/molecules/page-header/page-header'
import { StateView } from '../../../ui/molecules/state-view/state-view'
import type { Disposition, InboxItem } from '../model/inbox'

export const MIN_REASON_LENGTH = 5

/**
 * Review inbox (F4, F7 · G2, G3). Shows what is stopped with its reason
 * and rule, and lets a person confirm or send back what waits for them
 * (RF-02, RF-03). Confirmation is gated by the item's permission (R-Q1:
 * only Quality releases); the server decides for real.
 */
@Component({
  imports: [
    Button,
    ButtonLink,
    DocuDatePipe,
    FamilyTag,
    Icon,
    NgTemplateOutlet,
    PageHeader,
    RouterLink,
    RuleTag,
    StateView,
    StatusBadge,
  ],
  selector: 'app-inbox',
  templateUrl: './inbox-view.html',
})
export class InboxView {
  private readonly api = inject(ApiClient)
  private readonly auth = inject(AuthService)
  private readonly notifications = inject(NotificationService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly destroyRef = inject(DestroyRef)

  protected readonly rules = RULE_CODES
  protected readonly ruleInfo = RULES
  protected readonly families = FAMILY_CODES
  protected readonly familyLabels = FAMILY_LABELS
  protected readonly minReason = MIN_REASON_LENGTH

  readonly quarantine = signal<ApiState<InboxItem[]>>({ status: 'loading' })
  readonly inbox = signal<ApiState<InboxItem[]>>({ status: 'loading' })

  /** Filters live in the URL so Programa can link to "Ver por qué". */
  readonly ruleFilter = toSignal(
    this.route.queryParamMap.pipe(
      map((p) => {
        const rule = p.get('rule')
        return isRuleCode(rule) ? rule : null
      }),
    ),
    { initialValue: null },
  )
  readonly familyFilter = toSignal(
    this.route.queryParamMap.pipe(
      map((p) => {
        const family = p.get('family')
        return family && family in FAMILY_LABELS ? (family as FamilyCode) : null
      }),
    ),
    { initialValue: null },
  )

  readonly quarantineView = computed(() => this.filtered(this.quarantine()))
  readonly inboxView = computed(() => this.filtered(this.inbox()))
  readonly hasFilters = computed(
    () => this.ruleFilter() !== null || this.familyFilter() !== null,
  )

  readonly busyId = signal<string | null>(null)
  readonly rejectingId = signal<string | null>(null)
  readonly rejectReason = signal('')
  readonly reasonIsValid = computed(
    () => this.rejectReason().trim().length >= MIN_REASON_LENGTH,
  )

  constructor() {
    this.loadQuarantine()
    this.loadInbox()
  }

  loadQuarantine(): void {
    this.api
      .get<InboxItem[]>('/quarantine')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((s) => this.quarantine.set(s))
  }

  loadInbox(): void {
    this.api
      .get<InboxItem[]>('/inbox')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((s) => this.inbox.set(s))
  }

  setFilter(name: 'rule' | 'family', value: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [name]: value || null },
      queryParamsHandling: 'merge',
    })
  }

  clearFilters(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} })
  }

  /** R-Q1 and friends: the UI only avoids offering what the role cannot do. */
  canConfirm(item: InboxItem): boolean {
    return (
      item.requiredPermission === null || this.auth.can(item.requiredPermission)
    )
  }

  confirm(item: InboxItem): void {
    this.busyId.set(item.id)
    this.api
      .post<Disposition>(`/inbox/${item.id}/confirm`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyId.set(null)
          this.notifications.notify(
            `Dato confirmado: ${item.subject}.`,
            'success',
          )
          this.loadInbox()
        },
        error: (error: ApiError) => {
          this.busyId.set(null)
          this.notifications.notify(error.message, 'error')
        },
      })
  }

  startReject(item: InboxItem): void {
    this.rejectingId.set(item.id)
    this.rejectReason.set('')
  }

  cancelReject(): void {
    this.rejectingId.set(null)
    this.rejectReason.set('')
  }

  onReasonInput(event: Event): void {
    this.rejectReason.set((event.target as HTMLTextAreaElement).value)
  }

  submitReject(item: InboxItem): void {
    if (!this.reasonIsValid()) return
    this.busyId.set(item.id)
    this.api
      .post<Disposition>(`/inbox/${item.id}/reject`, {
        reason: this.rejectReason().trim(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyId.set(null)
          this.cancelReject()
          this.notifications.notify(
            `Enviado a cuarentena: ${item.subject}.`,
            'warning',
          )
          this.loadInbox()
          this.loadQuarantine()
        },
        error: (error: ApiError) => {
          this.busyId.set(null)
          this.notifications.notify(error.message, 'error')
        },
      })
  }

  private filtered(state: ApiState<InboxItem[]>): ApiState<InboxItem[]> {
    if (state.status !== 'ready') return state
    const rule = this.ruleFilter()
    const family = this.familyFilter()
    const data = state.data.filter(
      (item) =>
        (rule === null || item.ruleCode === rule) &&
        (family === null || item.source.family === family),
    )
    return data.length === 0 ? { status: 'empty' } : { status: 'ready', data }
  }
}
