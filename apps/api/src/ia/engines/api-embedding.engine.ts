/**
 * Embedding engine over the centralized transport (ADR-0020, IA.md §6).
 * The vector dimension is a frozen contract of the ER v1: vector(768). A
 * provider response with any other dimension is a contract violation with
 * an actionable remedy — never a vector that silently enters the base.
 */

import { estimateTokens } from '../cache.js'
import { ContractViolationError, EngineError } from '../errors.js'
import { type OpenAiCompatClient, readUsage } from '../openai-client.js'
import type {
  CallContext,
  EmbeddingEngine,
  EmbeddingOutput,
  TokenUsage,
} from '../types.js'

export const EMBEDDING_DIMENSIONS = 768

export class ApiEmbeddingEngine implements EmbeddingEngine {
  readonly kind = 'embedding' as const

  constructor(
    private readonly client: OpenAiCompatClient,
    readonly model: string,
    private readonly dimensions: number = EMBEDDING_DIMENSIONS,
  ) {}

  async embed(text: string, ctx: CallContext): Promise<EmbeddingOutput> {
    ctx.assertBudget(estimateTokens(text))

    // The request asks for the contracted dimension: providers with
    // Matryoshka vectors (Ollama with Qwen3-Embedding, OpenAI-compatible
    // servers) honor it and truncate their native vector. Without it, Ollama
    // answers 1024 for qwen3-embedding:0.6b and the contract fails.
    const response = await this.client.embeddings(
      { model: this.model, input: text, dimensions: this.dimensions },
      ctx.signal,
    )
    const vector = response.data[0]?.embedding
    if (vector === undefined || vector.length === 0) {
      throw new EngineError(
        'Embeddings response carries no vector. Check that the model is deployed at the endpoint.',
        this.model,
      )
    }
    if (vector.length !== this.dimensions) {
      throw new ContractViolationError(
        `Embedding dimension contract violated: model '${this.model}' returned ${vector.length} dimensions, the ER v1 requires ${this.dimensions} (vector(768), IA.md §6). The request already asked for ${this.dimensions} dimensions (the provider may ignore the 'dimensions' parameter). ` +
          'Point IA_EMBEDDING_MODEL to a model that honors 768 (qwen3-embedding:0.6b with MRL, embeddinggemma). ' +
          'Changing the stored dimension after production requires migrating vectors and a new ADR.',
      )
    }
    const usage: TokenUsage | undefined = readUsage(response.usage)
    return usage === undefined ? { vector } : { vector, usage }
  }
}
