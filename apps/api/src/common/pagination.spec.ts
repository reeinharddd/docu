import { describe, expect, test } from 'bun:test'
import { ApiError } from './api-error.js'
import { DEFAULT_LIMIT, MAX_LIMIT, parsePagination } from './pagination.js'

describe('pagination (ADR-0022)', () => {
  test('defaults', () => {
    expect(parsePagination({})).toEqual({ limit: DEFAULT_LIMIT, offset: 0 })
  })

  test('accepts valid values', () => {
    expect(parsePagination({ limit: '10', offset: '20' })).toEqual({
      limit: 10,
      offset: 20,
    })
  })

  test('rejects limit out of range', () => {
    const error = (() => {
      try {
        parsePagination({ limit: String(MAX_LIMIT + 1) })
        return null
      } catch (e) {
        return e
      }
    })()
    expect(error instanceof ApiError).toBe(true)
    expect((error as ApiError).code).toBe('VALIDATION_ERROR')
  })

  test('rejects a negative offset', () => {
    const error = (() => {
      try {
        parsePagination({ offset: '-1' })
        return null
      } catch (e) {
        return e
      }
    })()
    expect((error as ApiError).code).toBe('VALIDATION_ERROR')
  })

  test('rejects a non-integer limit', () => {
    const error = (() => {
      try {
        parsePagination({ limit: '10.5' })
        return null
      } catch (e) {
        return e
      }
    })()
    expect((error as ApiError).code).toBe('VALIDATION_ERROR')
  })
})
