import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { catchError, map, type Observable, of, startWith } from 'rxjs'
import { API_BASE_URL } from '../config/api-url'
import type { ApiState } from '../models/api-state'

const ERROR_MESSAGE =
  'No se pudo consultar la API. Verifica tu conexión y vuelve a intentar.'

/**
 * Typed single door to the DOCU API. Every read emits a complete state
 * (loading -> ready/empty/error) so screens always handle the three cases
 * and never touch raw data. URL base, token and error shape live in the
 * interceptors — change them there, not here.
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = inject(API_BASE_URL)

  get<T>(path: string): Observable<ApiState<T>> {
    return this.http.get<T>(`${this.baseUrl}${path}`).pipe(
      map((data) =>
        Array.isArray(data) && data.length === 0
          ? ({ status: 'empty' } as ApiState<T>)
          : ({ status: 'ready', data } as ApiState<T>),
      ),
      startWith({ status: 'loading' } as ApiState<T>),
      catchError(() =>
        of({ status: 'error', message: ERROR_MESSAGE } as ApiState<T>),
      ),
    )
  }
}
