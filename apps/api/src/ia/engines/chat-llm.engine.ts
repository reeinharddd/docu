/**
 * Text engine over the centralized transport (ADR-0020, IA.md §2). The
 * default model is Llama 3.2 served by Ollama. Every call runs with
 * temperature 0 and a fixed seed for reproducible evidence (RNF-07). When a
 * JSON schema is given, the provider is forced to structured output;
 * Zod validation against the family schema is the caller's job.
 */

import { estimateTokens } from '../cache.js'
import { EngineError } from '../errors.js'
import { type OpenAiCompatClient, readUsage } from '../openai-client.js'
import type {
  CallContext,
  LlmEngine,
  LlmOutput,
  LlmRequest,
  TokenUsage,
} from '../types.js'

export class ChatLlmEngine implements LlmEngine {
  readonly kind = 'llm' as const

  constructor(
    private readonly client: OpenAiCompatClient,
    readonly model: string,
    private readonly temperature: number,
    private readonly seed: number,
  ) {}

  async complete(request: LlmRequest, ctx: CallContext): Promise<LlmOutput> {
    ctx.assertBudget(
      estimateTokens(request.system) + estimateTokens(request.prompt),
    )

    const response = await this.client.chat(
      {
        model: this.model,
        messages: [
          { role: 'system', content: request.system },
          { role: 'user', content: request.prompt },
        ],
        temperature: this.temperature,
        seed: this.seed,
        ...(request.maxTokens === undefined
          ? {}
          : { max_tokens: request.maxTokens }),
        ...(request.jsonSchema === undefined
          ? {}
          : {
              response_format: {
                type: 'json_schema' as const,
                json_schema: request.jsonSchema,
              },
            }),
      },
      ctx.signal,
    )

    const raw = response.choices[0]?.message.content ?? ''
    let json: unknown
    try {
      json = JSON.parse(raw)
    } catch {
      throw new EngineError(
        'LLM returned non-JSON output despite the schema contract. ' +
          'Route the document to quarantine with a reason and record the raw output in the trace.',
        this.model,
      )
    }
    const usage: TokenUsage | undefined = readUsage(response.usage)
    return usage === undefined ? { json, raw } : { json, raw, usage }
  }
}
