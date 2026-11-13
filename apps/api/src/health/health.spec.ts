import { describe, expect, it } from 'bun:test'
import { healthReport, type WorkerHealth } from './probes.js'

const WORKER_UP: WorkerHealth = {
  alive: true,
  queues: {
    ingest: {
      waiting: 0,
      active: 1,
      delayed: 0,
      failed: 0,
      completed: 2,
      paused: 0,
    },
  },
}

describe('health report', () => {
  it('is ok when every segment answers', () => {
    expect(healthReport('up', 'up', WORKER_UP)).toEqual({
      status: 'ok',
      postgres: 'up',
      redis: 'up',
      worker: WORKER_UP,
    })
  })

  it('is degraded and names the failed segment', () => {
    expect(healthReport('up', 'down', WORKER_UP).status).toBe('degraded')
    expect(healthReport('up', 'down', WORKER_UP).postgres).toBe('up')
    expect(healthReport('up', 'down', WORKER_UP).redis).toBe('down')
    expect(healthReport('down', 'up', WORKER_UP).status).toBe('degraded')
    expect(healthReport('down', 'up', WORKER_UP).postgres).toBe('down')
  })

  it('is degraded when both segments are down', () => {
    expect(healthReport('down', 'down', WORKER_UP)).toEqual({
      status: 'degraded',
      postgres: 'down',
      redis: 'down',
      worker: WORKER_UP,
    })
  })

  it('is degraded when the worker is not alive', () => {
    const report = healthReport('up', 'up', { alive: false, queues: {} })
    expect(report.status).toBe('degraded')
    expect(report.worker.alive).toBe(false)
  })
})
