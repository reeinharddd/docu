import { Component, DestroyRef, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { RouterLink } from '@angular/router'
import { ApiClient } from '../../../core/services/api/api-client'
import { NotificationService } from '../../../core/services/notifications/notification.service'
import type { ApiError } from '../../../core/types/api-error'
import type { ApiState } from '../../../core/types/api-state'
import {
  FAMILY_CODES,
  FAMILY_LABELS,
  type FamilyCode,
} from '../../../core/types/catalog'
import { ButtonLink } from '../../../ui/atoms/button/button'
import { FamilyTag } from '../../../ui/atoms/family-tag/family-tag'
import { Icon } from '../../../ui/atoms/icon/icon'
import { RuleTag } from '../../../ui/atoms/rule-tag/rule-tag'
import { StatusBadge } from '../../../ui/atoms/status-badge/status-badge'
import { PageHeader } from '../../../ui/molecules/page-header/page-header'
import { StateView } from '../../../ui/molecules/state-view/state-view'
import { SAMPLE_FILES } from '../fixtures/capture.fixture'
import type { FileValidation, UploadReceipt } from '../model/capture'

/** Formats the plant uses today (RF-01): Excel, PDF, mail and scans. */
export const ACCEPTED_EXTENSIONS = [
  '.xlsx',
  '.xls',
  '.csv',
  '.pdf',
  '.eml',
  '.png',
  '.jpg',
  '.jpeg',
]
export const MAX_FILE_BYTES = 25 * 1024 * 1024

export interface Upload {
  localId: number
  fileName: string
  size: number
  phase: 'uploading' | 'validating' | 'done' | 'failed'
  sha256: string | null
  validation: ApiState<FileValidation>
  error: string | null
}

/**
 * Capture (F2, F3, F4, F5 · G1, G2). Drop or pick a file; DOCU keeps the
 * original untouched, assigns its family and runs the rule chain. The
 * client checks type and size only for UX: the server decides (RF-01).
 */
@Component({
  imports: [
    ButtonLink,
    FamilyTag,
    Icon,
    PageHeader,
    RouterLink,
    RuleTag,
    StateView,
    StatusBadge,
  ],
  selector: 'app-capture',
  templateUrl: './capture-view.html',
})
export class CaptureView {
  private readonly api = inject(ApiClient)
  private readonly notifications = inject(NotificationService)
  private readonly destroyRef = inject(DestroyRef)
  private nextId = 1

  protected readonly families = FAMILY_CODES
  protected readonly familyLabels = FAMILY_LABELS
  protected readonly accept = ACCEPTED_EXTENSIONS.join(',')

  readonly uploads = signal<Upload[]>([])
  readonly declaredFamily = signal<FamilyCode | null>(null)
  readonly dragging = signal(false)

  onFamilyChange(value: string): void {
    this.declaredFamily.set(value ? (value as FamilyCode) : null)
  }

  onPick(event: Event): void {
    const input = event.target as HTMLInputElement
    this.addFiles(input.files)
    input.value = ''
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault()
    this.dragging.set(true)
  }

  onDragLeave(): void {
    this.dragging.set(false)
  }

  onDrop(event: DragEvent): void {
    event.preventDefault()
    this.dragging.set(false)
    this.addFiles(event.dataTransfer?.files ?? null)
  }

  addFiles(list: FileList | File[] | null): void {
    for (const file of Array.from(list ?? [])) this.upload(file)
  }

  /** DEMO ONLY — uploads the case's own documents without needing them on disk. */
  useSamples(): void {
    this.addFiles(
      SAMPLE_FILES.map((s) => new File(['demo'], s.name, { type: s.type })),
    )
  }

  upload(file: File): void {
    const localId = this.nextId++
    const problem = clientCheck(file)
    this.uploads.update((all) => [
      {
        localId,
        fileName: file.name,
        size: file.size,
        phase: problem ? 'failed' : 'uploading',
        sha256: null,
        validation: { status: 'loading' },
        error: problem,
      },
      ...all,
    ])
    if (problem) return

    const form = new FormData()
    form.append('file', file)
    const family = this.declaredFamily()
    if (family) form.append('family', family)

    this.api
      .post<UploadReceipt>('/files', form)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (receipt) => {
          this.patch(localId, { phase: 'validating', sha256: receipt.sha256 })
          this.validate(localId, receipt.sourceFileId)
        },
        error: (error: ApiError) => {
          this.patch(localId, { phase: 'failed', error: error.message })
          this.notifications.notify(error.message, 'error')
        },
      })
  }

  private validate(localId: number, sourceFileId: string): void {
    this.api
      .get<FileValidation>(`/files/${sourceFileId}/validation`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        if (state.status === 'loading') return
        this.patch(localId, { phase: 'done', validation: state })
        if (state.status === 'ready') this.announce(state.data)
      })
  }

  private announce(v: FileValidation): void {
    if (v.decision === 'valid') {
      this.notifications.notify(`${v.fileName} pasó la validación.`, 'success')
    } else if (v.decision === 'quarantine') {
      this.notifications.notify(
        `${v.fileName} quedó detenido en la bandeja.`,
        'warning',
      )
    } else {
      this.notifications.notify(
        `${v.fileName} espera revisión en la bandeja.`,
        'info',
      )
    }
  }

  private patch(localId: number, changes: Partial<Upload>): void {
    this.uploads.update((all) =>
      all.map((u) => (u.localId === localId ? { ...u, ...changes } : u)),
    )
  }

  protected shortHash(sha: string | null): string {
    return sha ? `${sha.slice(0, 8)}…${sha.slice(-6)}` : '—'
  }

  protected sizeLabel(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
}

function clientCheck(file: File): string | null {
  const name = file.name.toLowerCase()
  if (!ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return 'Ese tipo de archivo no se acepta. Sube Excel, CSV, PDF, correo (.eml) o imagen.'
  }
  if (file.size > MAX_FILE_BYTES) {
    return 'El archivo pasa de 25 MB. Divídelo o pide ayuda a Sistemas.'
  }
  return null
}
