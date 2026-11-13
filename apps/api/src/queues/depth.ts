// Profundidad de una cola: cuántos trabajos hay en cada estado. Es lo que
// la salud muestra para que se vea si algo se está acumitando (BRIEF #46).
import type { Queue } from 'bullmq'
import type { QueueDepth } from './heartbeat.js'

const COUNT_TYPES = [
  'waiting',
  'active',
  'delayed',
  'failed',
  'completed',
] as const

export async function depthOf(queue: Queue): Promise<QueueDepth> {
  const counts = await queue.getJobCounts(...COUNT_TYPES)
  return {
    waiting: counts.waiting ?? 0,
    active: counts.active ?? 0,
    delayed: counts.delayed ?? 0,
    failed: counts.failed ?? 0,
    completed: counts.completed ?? 0,
    paused: counts.paused ?? 0,
  }
}
