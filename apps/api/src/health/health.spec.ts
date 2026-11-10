import { describe, expect, it } from 'bun:test'
import { healthReport } from './probes.js'

describe('health report', () => {
  it('is ok when both segments answer', () => {
    expect(healthReport('up', 'up')).toEqual({
      status: 'ok',
      postgres: 'up',
      redis: 'up',
    })
  })

  it('is degraded and names the failed segment', () => {
    expect(healthReport('up', 'down')).toEqual({
      status: 'degraded',
      postgres: 'up',
      redis: 'down',
    })
    expect(healthReport('down', 'up')).toEqual({
      status: 'degraded',
      postgres: 'down',
      redis: 'up',
    })
  })

  it('is degraded when both segments are down', () => {
    expect(healthReport('down', 'down')).toEqual({
      status: 'degraded',
      postgres: 'down',
      redis: 'down',
    })
  })
})
