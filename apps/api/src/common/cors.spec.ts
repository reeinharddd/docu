// Offline unit tests of the CORS allowlist parser (SEC-01).
import { describe, expect, test } from 'bun:test'
import { parseCorsOrigins } from './cors.js'

describe('parseCorsOrigins', () => {
  test('sin variable no refleja ningun origen', () => {
    expect(parseCorsOrigins(undefined)).toBe(false)
  })

  test('cadena vacia no refleja ningun origen', () => {
    expect(parseCorsOrigins('')).toBe(false)
  })

  test('una lista de espacios no refleja ningun origen', () => {
    expect(parseCorsOrigins(' , , ')).toBe(false)
  })

  test('un origen se respeta sin espacios', () => {
    expect(parseCorsOrigins('http://localhost:4200')).toEqual([
      'http://localhost:4200',
    ])
  })

  test('varios origenes separados por coma y recortados', () => {
    expect(
      parseCorsOrigins(' http://localhost:4200 , https://docu.example.com '),
    ).toEqual(['http://localhost:4200', 'https://docu.example.com'])
  })
})
