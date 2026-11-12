// ApiError — the single error envelope of the API (ALCANCE-SOLUCION.md §2.1).
//
// Every non-2xx response is `{ code, message, details }`. `code` is a stable
// contract value consumed by the frontend error interceptor; `message` is
// human, in Spanish and safe to display; `details` never carries internals.
import { HttpException } from '@nestjs/common'

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL'

const HTTP_BY_CODE: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 422,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
}

export class ApiError extends HttpException {
  readonly code: ApiErrorCode
  readonly details: Record<string, unknown>

  constructor(
    code: ApiErrorCode,
    message: string,
    details: Record<string, unknown> = {},
  ) {
    super({ code, message, details }, HTTP_BY_CODE[code])
    this.code = code
    this.details = details
  }

  static validation(
    message: string,
    details?: Record<string, unknown>,
  ): ApiError {
    return new ApiError('VALIDATION_ERROR', message, details)
  }

  static unauthenticated(message = 'No hay sesión activa.'): ApiError {
    return new ApiError('UNAUTHENTICATED', message)
  }

  static forbidden(message = 'No tienes permiso para esta acción.'): ApiError {
    return new ApiError('FORBIDDEN', message)
  }

  static notFound(message = 'Recurso no encontrado.'): ApiError {
    return new ApiError('NOT_FOUND', message)
  }

  static conflict(
    message: string,
    details?: Record<string, unknown>,
  ): ApiError {
    return new ApiError('CONFLICT', message, details)
  }

  static rateLimited(
    message = 'Demasiadas peticiones.',
    details?: Record<string, unknown>,
  ): ApiError {
    return new ApiError('RATE_LIMITED', message, details)
  }

  static internal(): ApiError {
    // Sin mensaje del error real: los detalles internos nunca salen (§2.1).
    return new ApiError('INTERNAL', 'Error interno del servidor.')
  }
}
