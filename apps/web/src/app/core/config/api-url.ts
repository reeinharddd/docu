import { InjectionToken } from '@angular/core'

/**
 * Base de la API en un solo lugar. El interceptor apiBase la antepone a toda
 * ruta relativa; cuando haya entorno de despliegue (RNF-06), se cambia aqui,
 * no en las pantallas.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () => '/v1',
})
