/**
 * Per-call budget (brief #85): a time ceiling through AbortSignal and a
 * token ceiling asserted by the engine before and during the call. A cut is
 * never silent: the runner records it in the trace with budgetCut: true.
 */
import { BudgetExceededError } from './errors.js'

export class Budget {
  private cut = false
  readonly signal: AbortSignal

  constructor(
    readonly maxMs: number,
    private readonly maxTokens: number,
  ) {
    this.signal = AbortSignal.timeout(maxMs)
  }

  assertTokens(estimatedTokens: number): void {
    if (estimatedTokens > this.maxTokens) {
      this.cut = true
      throw new BudgetExceededError('tokens', this.maxTokens, estimatedTokens)
    }
    if (this.signal.aborted) {
      this.cut = true
      throw new BudgetExceededError('time', this.maxMs, this.maxMs)
    }
  }

  get isCut(): boolean {
    return this.cut || this.signal.aborted
  }
}
