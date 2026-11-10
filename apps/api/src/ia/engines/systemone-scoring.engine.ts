/**
 * Scoring engine with calibrated confidence over the SystemOne API family
 * (OCR.md §6, OCR-MERCADO.md). Default endpoint serves Laya `multilingual`
 * locally; Jev, Decider or Clef-compatible engines are swapped by changing
 * IA_SCORING_URL — same wire contract, different engine. The returned
 * confidence is calibrated (Laya: ECE 0.081) and only ORDERS human review:
 * it never publishes anything (ADR-0006, IA.md §3).
 */

import { estimateTokens } from '../cache.js'
import { EngineError } from '../errors.js'
import type { FetchLike } from '../openai-client.js'
import type {
  CallContext,
  ScoringEngine,
  ScoringInput,
  ScoringOutput,
} from '../types.js'

export interface SystemOneRequest {
  input: string
  labels: readonly string[]
}

export interface SystemOneResponse {
  label: string
  confidence: number
}

export class SystemOneScoringEngine implements ScoringEngine {
  readonly kind = 'scoring' as const

  constructor(
    private readonly url: string,
    readonly model: string,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  async score(input: ScoringInput, ctx: CallContext): Promise<ScoringOutput> {
    if (input.candidates.length === 0) {
      throw new EngineError(
        'Scoring input has no candidate labels: nothing to score against.',
        this.model,
      )
    }
    ctx.assertBudget(
      estimateTokens(input.text) + estimateTokens(input.candidates.join('\n')),
    )

    let response: Response
    try {
      response = await this.fetchImpl(this.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          input: input.text,
          labels: input.candidates,
        } satisfies SystemOneRequest),
        signal: ctx.signal,
      })
    } catch (error) {
      throw new EngineError(
        `Scoring endpoint unreachable at ${this.url}: ${error instanceof Error ? error.message : String(error)}. ` +
          'Start the local SystemOne-compatible server (Laya) or point IA_SCORING_URL at the right engine.',
        this.model,
      )
    }
    if (!response.ok) {
      const detail = (await response.text().catch(() => '')).slice(0, 300)
      throw new EngineError(
        `Scoring endpoint rejected the call with HTTP ${response.status}: ${detail}`,
        this.model,
        response.status,
      )
    }
    const payload = (await response.json()) as Partial<SystemOneResponse>
    const { label, confidence } = payload
    if (
      typeof label !== 'string' ||
      typeof confidence !== 'number' ||
      Number.isNaN(confidence) ||
      confidence < 0 ||
      confidence > 1
    ) {
      throw new EngineError(
        `Scoring endpoint returned an invalid verdict (${JSON.stringify(payload).slice(0, 200)}). ` +
          'The SystemOne contract requires { label: string, confidence: number in [0, 1] }.',
        this.model,
      )
    }
    if (!input.candidates.includes(label)) {
      throw new EngineError(
        `Scoring endpoint returned label '${label}' outside the candidate set. ` +
          'An invented family contaminates the canonical model: route to quarantine with a reason (IA.md §3).',
        this.model,
      )
    }
    return { label, confidence }
  }
}
