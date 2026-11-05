import type { ApiErrorCode } from './api-error'

export type ApiState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'empty' }
  | { status: 'error'; message: string; code?: ApiErrorCode }
