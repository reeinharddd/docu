/**
 * Engine contracts for the centralized IA access layer (ADR-0020).
 *
 * All engines share one OpenAI-compatible transport; each capability picks
 * its model through configuration. Engines are dumb: they turn inputs into
 * provider calls and outputs back. Budget, cache, retries and traceability
 * live in the runner (`ia-runner.ts`), not in the engines.
 *
 * Output validation is the caller's job (Zod against the family schema,
 * IA.md §2). A malformed model response surfaces as EngineError here and
 * becomes a quarantine entry upstream — never a silent pass.
 */

export type EngineKind = 'ocr' | 'llm' | 'embedding' | 'scoring'

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
}

export interface OcrInput {
  bytes: Uint8Array
  mimeType: string
  language?: string
  prompt?: string
}

export interface OcrOutput {
  text: string
  usage?: TokenUsage
}

export interface LlmRequest {
  system: string
  prompt: string
  jsonSchema?: { name: string; schema: Record<string, unknown> }
  maxTokens?: number
}

export interface LlmOutput {
  json: unknown
  raw: string
  usage?: TokenUsage
}

export interface EmbeddingOutput {
  vector: number[]
  usage?: TokenUsage
}

export interface ScoringInput {
  text: string
  candidates: readonly string[]
}

export interface ScoringOutput {
  label: string
  confidence: number
}

export interface CallContext {
  signal: AbortSignal
  assertBudget(estimatedTokens: number): void
}

export interface OcrEngine {
  readonly kind: 'ocr'
  readonly model: string
  recognize(input: OcrInput, ctx: CallContext): Promise<OcrOutput>
}

export interface LlmEngine {
  readonly kind: 'llm'
  readonly model: string
  complete(request: LlmRequest, ctx: CallContext): Promise<LlmOutput>
}

export interface EmbeddingEngine {
  readonly kind: 'embedding'
  readonly model: string
  embed(text: string, ctx: CallContext): Promise<EmbeddingOutput>
}

/**
 * In-process scoring with calibrated confidence (Laya, OCR.md §6). It is
 * NOT served over the API: the classification lane (#3) implements it
 * inside the worker on top of this interface.
 */
export interface ScoringEngine {
  readonly kind: 'scoring'
  readonly model: string
  score(input: ScoringInput): Promise<ScoringOutput>
}

export interface CallTrace {
  kind: EngineKind
  model: string
  inputSha256: string
  inputTokens: number
  outputTokens: number
  durationMs: number
  cached: boolean
  budgetCut: boolean
  error?: string
}
