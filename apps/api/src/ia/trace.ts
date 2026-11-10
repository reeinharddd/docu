/**
 * Traceability of every IA call (brief #85): engine, model, input hash,
 * tokens, duration, cache and budget cuts. The worker persists these
 * records (ocr_result.engine, memory_embedding.model, job_run, audit_log);
 * this recorder keeps the recent window in memory.
 */
import type { CallTrace } from './types.js'

const MAX_TRACES = 100

export class TraceRecorder {
  private readonly items: CallTrace[] = []

  record(trace: CallTrace): void {
    this.items.push(trace)
    if (this.items.length > MAX_TRACES) this.items.shift()
  }

  all(): readonly CallTrace[] {
    return [...this.items]
  }
}
