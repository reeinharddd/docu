import { Pipe, type PipeTransform } from '@angular/core'

/**
 * Formatting in one place, es-MX and in plant time (C1 is in Baja
 * California). Numbers use es-MX grouping; dates show the plant clock no
 * matter where the browser is.
 */
const PLANT_TIME_ZONE = 'America/Tijuana'

const DATE_TIME = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: PLANT_TIME_ZONE,
})

const DATE_ONLY = new Intl.DateTimeFormat('es-MX', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: PLANT_TIME_ZONE,
})

const DATE_LONG = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: PLANT_TIME_ZONE,
})

const NUMBER = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })

export type DateStyle = 'datetime' | 'date' | 'long'

/** Plain YYYY-MM-DD dates are calendar days: read them at plant noon. */
function toDate(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00-07:00`)
    : new Date(value)
}

export function formatDate(
  value: string | null | undefined,
  style: DateStyle = 'datetime',
): string {
  if (!value) return '—'
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return '—'
  if (style === 'date') return DATE_ONLY.format(date)
  if (style === 'long') return DATE_LONG.format(date)
  return DATE_TIME.format(date)
}

export function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : NUMBER.format(value)
}

@Pipe({ name: 'docuDate' })
export class DocuDatePipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    style: DateStyle = 'datetime',
  ): string {
    return formatDate(value, style)
  }
}

@Pipe({ name: 'docuNumber' })
export class DocuNumberPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatNumber(value)
  }
}
