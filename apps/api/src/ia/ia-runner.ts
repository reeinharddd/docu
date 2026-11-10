/**
 * The runner is the single entry point to every IA capability (ADR-0020).
 * It centralizes what must be uniform across engines: content-hash cache,
 * per-call budget and the trace of every call. Engines stay dumb; the
 * worker consumes the runner and persists the traces.
 */

import { Budget } from './budget.js'
import {
  type CacheStore,
  cacheKey,
  estimateTokens,
  MemoryCacheStore,
  ResultCache,
  sha256Hex,
} from './cache.js'
import { type IaConfig, loadIaConfig } from './config.js'
import { ApiEmbeddingEngine } from './engines/api-embedding.engine.js'
import { ChatLlmEngine } from './engines/chat-llm.engine.js'
import { SystemOneScoringEngine } from './engines/systemone-scoring.engine.js'
import { VisionOcrEngine } from './engines/vision-ocr.engine.js'
import { BudgetExceededError } from './errors.js'
import type { FetchLike } from './openai-client.js'
import { OpenAiCompatClient } from './openai-client.js'
import { TraceRecorder } from './trace.js'
import type {
  CallTrace,
  EmbeddingOutput,
  LlmOutput,
  LlmRequest,
  OcrInput,
  OcrOutput,
  ScoringInput,
  ScoringOutput,
  TokenUsage,
} from './types.js'

export interface IaRunnerOptions {
  config?: IaConfig
  client?: OpenAiCompatClient
  cacheStore?: CacheStore | null
  scoringFetch?: FetchLike
}

type ExecuteContext = {
  signal: AbortSignal
  assertBudget: (tokens: number) => void
}

export class IaRunner {
  readonly ocr: VisionOcrEngine
  readonly llm: ChatLlmEngine
  readonly embedding: ApiEmbeddingEngine
  readonly scoring: SystemOneScoringEngine

  private readonly config: IaConfig
  private readonly cache: ResultCache
  private readonly traces = new TraceRecorder()
  private readonly now: () => number

  constructor(options: IaRunnerOptions = {}) {
    this.config = options.config ?? loadIaConfig()
    const client =
      options.client ??
      new OpenAiCompatClient(
        this.config.baseUrl,
        this.config.apiKey,
        this.config.maxRetries,
      )
    this.ocr = new VisionOcrEngine(client, this.config.ocrModel)
    this.llm = new ChatLlmEngine(
      client,
      this.config.llmModel,
      this.config.temperature,
      this.config.seed,
    )
    this.embedding = new ApiEmbeddingEngine(client, this.config.embeddingModel)
    this.scoring = new SystemOneScoringEngine(
      this.config.scoringUrl,
      'laya-multilingual',
      options.scoringFetch ?? fetch,
    )
    const store: CacheStore | null =
      options.cacheStore ??
      (this.config.cacheEnabled ? new MemoryCacheStore() : null)
    this.cache = new ResultCache(store)
    this.now = () => Date.now()
  }

  async recognizeDocument(input: OcrInput): Promise<OcrOutput> {
    const inputSha256 = sha256Hex(input.bytes)
    return this.run<OcrOutput>(
      'ocr',
      this.ocr.model,
      [inputSha256, input.mimeType, input.language ?? '', input.prompt ?? ''],
      Math.ceil(input.bytes.byteLength / 4),
      (ctx) => this.ocr.recognize(input, ctx),
      inputSha256,
      (output) => output.usage,
    )
  }

  async complete(request: LlmRequest): Promise<LlmOutput> {
    const inputSha256 = sha256Hex(`${request.system}\u0000${request.prompt}`)
    return this.run<LlmOutput>(
      'llm',
      this.llm.model,
      [
        inputSha256,
        request.jsonSchema === undefined
          ? ''
          : JSON.stringify(request.jsonSchema),
        String(request.maxTokens ?? ''),
      ],
      estimateTokens(request.system) + estimateTokens(request.prompt),
      (ctx) => this.llm.complete(request, ctx),
      inputSha256,
      (output) => output.usage,
    )
  }

  async embed(text: string): Promise<EmbeddingOutput> {
    const inputSha256 = sha256Hex(text)
    return this.run<EmbeddingOutput>(
      'embedding',
      this.embedding.model,
      [inputSha256],
      estimateTokens(text),
      (ctx) => this.embedding.embed(text, ctx),
      inputSha256,
      (output) => output.usage,
    )
  }

  async score(input: ScoringInput): Promise<ScoringOutput> {
    const inputSha256 = sha256Hex(
      `${input.text}\u0000${[...input.candidates].sort().join('\u0000')}`,
    )
    return this.run<ScoringOutput>(
      'scoring',
      this.scoring.model,
      [inputSha256],
      estimateTokens(input.text),
      (ctx) => this.scoring.score(input, ctx),
      inputSha256,
      () => undefined,
    )
  }

  snapshot(): readonly CallTrace[] {
    return this.traces.all()
  }

  get cacheStats(): { hits: number; misses: number } {
    return this.cache.stats
  }

  private async run<T>(
    kind: CallTrace['kind'],
    model: string,
    keyParts: readonly string[],
    estimatedTokens: number,
    execute: (ctx: ExecuteContext) => Promise<T>,
    inputSha256: string,
    usageOf: (result: T) => TokenUsage | undefined,
  ): Promise<T> {
    const key = cacheKey([kind, model, ...keyParts])
    const cached = this.cache.lookup<T>(key)
    if (cached !== undefined) {
      this.recordTrace(kind, model, inputSha256, 0, 0, 0, true, false)
      return cached
    }

    const startedAt = this.now()
    const budget = new Budget(
      this.config.budgetMaxMs,
      this.config.budgetMaxTokens,
    )
    try {
      budget.assertTokens(estimatedTokens)
      const result = await execute({
        signal: budget.signal,
        assertBudget: (tokens: number) => budget.assertTokens(tokens),
      })
      this.cache.save(key, result, this.config.cacheTtlMs)
      const usage = usageOf(result)
      this.recordTrace(
        kind,
        model,
        inputSha256,
        usage?.inputTokens ?? estimatedTokens,
        usage?.outputTokens ?? 0,
        this.now() - startedAt,
        false,
        false,
      )
      return result
    } catch (error) {
      const budgetCut = budget.isCut || error instanceof BudgetExceededError
      this.recordTrace(
        kind,
        model,
        inputSha256,
        0,
        0,
        this.now() - startedAt,
        false,
        budgetCut,
        error instanceof Error ? error.message : String(error),
      )
      throw error
    }
  }

  private recordTrace(
    kind: CallTrace['kind'],
    model: string,
    inputSha256: string,
    inputTokens: number,
    outputTokens: number,
    durationMs: number,
    cached: boolean,
    budgetCut: boolean,
    error?: string,
  ): void {
    const trace: CallTrace = {
      kind,
      model,
      inputSha256,
      inputTokens,
      outputTokens,
      durationMs,
      cached,
      budgetCut,
      ...(error === undefined ? {} : { error }),
    }
    this.traces.record(trace)
  }
}
