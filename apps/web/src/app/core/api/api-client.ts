import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { catchError, map, type Observable, of, startWith } from 'rxjs'
import type { ApiState } from '../models/api-state'

const API_BASE = '/v1'
const MENSAJE_ERROR =
  'No se pudo consultar la API. Verifica tu conexión y vuelve a intentar.'

/**
 * Cliente de la API de DOCU: una sola puerta tipada para las pantallas.
 * Toda lectura emite un estado completo (carga -> listo/vacío/error),
 * nunca un dato crudo, para que la UI maneje siempre los tres casos.
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient)

  get<T>(path: string): Observable<ApiState<T>> {
    return this.http.get<T>(`${API_BASE}${path}`).pipe(
      map((data) =>
        Array.isArray(data) && data.length === 0
          ? ({ status: 'empty' } as ApiState<T>)
          : ({ status: 'ready', data } as ApiState<T>),
      ),
      startWith({ status: 'loading' } as ApiState<T>),
      catchError(() =>
        of({ status: 'error', message: MENSAJE_ERROR } as ApiState<T>),
      ),
    )
  }
}
