/**
 * The single error envelope of the DOCU API. The backend (NestJS, #12)
 * returns this shape on every non-2xx; the frontend maps it 1:1. Same
 * TypeScript on both sides — when packages/ exists it moves there untouched.
 * Codes are stable contract values; the server never leaks stack traces or
 * internals (INTERNAL only says something went wrong).
 */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL'

export interface ApiError {
  code: ApiErrorCode
  /** Human-readable, in Spanish (RNF-01). Safe to show in the UI. */
  message: string
  /** Optional structured details (e.g. which rule failed). */
  details?: unknown
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    typeof (value as ApiError).message === 'string'
  )
}
