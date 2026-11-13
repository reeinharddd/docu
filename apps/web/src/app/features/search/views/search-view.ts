import { Component, computed, DestroyRef, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { BehaviorSubject, combineLatest, map, of, switchMap, tap } from 'rxjs'
import { DocuDatePipe } from '../../../core/format/format'
import { ApiClient } from '../../../core/services/api/api-client'
import type { ApiState } from '../../../core/types/api-state'
import type { Department } from '../../../core/types/permissions'
import { Button } from '../../../ui/atoms/button/button'
import { FamilyTag } from '../../../ui/atoms/family-tag/family-tag'
import { Icon } from '../../../ui/atoms/icon/icon'
import { RuleTag } from '../../../ui/atoms/rule-tag/rule-tag'
import { StatusBadge } from '../../../ui/atoms/status-badge/status-badge'
import { PageHeader } from '../../../ui/molecules/page-header/page-header'
import { StateView } from '../../../ui/molecules/state-view/state-view'
import type { Lineage, OfficialRecord } from '../model/search'

export const AREAS: ReadonlyArray<{ value: Department; label: string }> = [
  { value: 'planeacion', label: 'Planeación' },
  { value: 'almacen', label: 'Almacén' },
  { value: 'calidad', label: 'Calidad' },
  { value: 'produccion', label: 'Producción' },
  { value: 'materiales', label: 'Materiales' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
]

export interface SearchFilters {
  q: string
  area: string
  from: string
}

/**
 * Search with citation (F6, F7, F8 · G5, G6). Every value says which file
 * and rule it came from, how it was calculated and who confirmed it
 * (RF-04, RNF-02); the lineage shows roll -> order -> machine -> shift ->
 * document. Filters live in the URL so any screen can link here.
 */
@Component({
  imports: [
    Button,
    DocuDatePipe,
    FamilyTag,
    Icon,
    PageHeader,
    RouterLink,
    RuleTag,
    StateView,
    StatusBadge,
  ],
  selector: 'app-search',
  templateUrl: './search-view.html',
})
export class SearchView {
  private readonly api = inject(ApiClient)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly destroyRef = inject(DestroyRef)

  protected readonly areas = AREAS

  readonly filters = signal<SearchFilters>({ q: '', area: '', from: '' })
  /** idle = nothing asked yet: an invitation, not an empty result. */
  readonly results = signal<ApiState<OfficialRecord[]> | { status: 'idle' }>({
    status: 'idle',
  })
  readonly selectedId = signal<string | null>(null)
  readonly lineage = signal<ApiState<Lineage>>({ status: 'loading' })
  private readonly reload$ = new BehaviorSubject<void>(undefined)

  readonly resultsState = computed<ApiState<OfficialRecord[]>>(() => {
    const r = this.results()
    return r.status === 'idle' ? { status: 'loading' } : r
  })

  constructor() {
    combineLatest([this.route.queryParamMap, this.reload$])
      .pipe(
        map(
          ([p]): SearchFilters => ({
            q: p.get('q') ?? '',
            area: p.get('area') ?? '',
            from: p.get('from') ?? '',
          }),
        ),
        tap((f) => this.filters.set(f)),
        switchMap((f) =>
          f.q || f.area || f.from
            ? this.api.get<OfficialRecord[]>(`/official-records?${toQuery(f)}`)
            : of({ status: 'idle' } as const),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((state) => {
        this.results.set(state)
        if (state.status === 'ready') this.select(state.data[0]?.id ?? null)
        else this.selectedId.set(null)
      })
  }

  search(event: Event): void {
    event.preventDefault()
    const form = new FormData(event.target as HTMLFormElement)
    const value = (name: string) => String(form.get(name) ?? '').trim() || null
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: value('q'), area: value('area'), from: value('from') },
    })
  }

  retry(): void {
    this.reload$.next()
  }

  select(id: string | null): void {
    this.selectedId.set(id)
    if (!id) return
    this.api
      .get<Lineage>(`/lineage/${id}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((s) => this.lineage.set(s))
  }
}

function toQuery(f: SearchFilters): string {
  const params = new URLSearchParams()
  if (f.q) params.set('q', f.q)
  if (f.area) params.set('area', f.area)
  if (f.from) params.set('from', f.from)
  return params.toString()
}
