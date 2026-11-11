// Pagination helper — ADR-0022: `limit` + `offset`, array plano en el cuerpo
// y total en `X-Total-Count`. Valores fuera de rango son 422, no silencio.
import { ApiError } from './api-error.js'

export const DEFAULT_LIMIT = 50
export const MAX_LIMIT = 200

export interface Page {
  limit: number
  offset: number
}

type Query = Record<string, unknown>

function readInt(raw: unknown, field: 'limit' | 'offset'): number | undefined {
  if (raw === undefined || raw === '') {
    return undefined
  }
  const value = Number(raw)
  if (!Number.isInteger(value)) {
    throw ApiError.validation(`${field} debe ser un entero.`, {
      field,
      value: String(raw),
    })
  }
  return value
}

export function parsePagination(query: Query): Page {
  const limit = readInt(query.limit, 'limit') ?? DEFAULT_LIMIT
  const offset = readInt(query.offset, 'offset') ?? 0

  if (limit < 1 || limit > MAX_LIMIT) {
    throw ApiError.validation(`limit debe estar entre 1 y ${MAX_LIMIT}.`, {
      field: 'limit',
      value: limit,
    })
  }
  if (offset < 0) {
    throw ApiError.validation('offset no puede ser negativo.', {
      field: 'offset',
      value: offset,
    })
  }
  return { limit, offset }
}
