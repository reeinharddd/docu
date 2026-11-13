/**
 * The single OpenAI-compatible transport (ADR-0020). One client talks to
 * any provider that exposes /v1/chat/completions and /v1/embeddings:
 * Ollama local, vLLM/SGLang, NVIDIA NIM, OpenAI, or a company endpoint.
 *
 * Security: the credential travels only in the Authorization header and is
 * never logged; provider error bodies are truncated before surfacing.
 * Retries (429/5xx/network) use exponential backoff and share the caller's
 * AbortSignal, so a budget cut always wins over a retry.
 */
import { EngineError } from './errors.js'

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>

export type ChatContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } }
    >

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: ChatContent
}

export interface JsonSchemaFormat {
  name: string
  schema: Record<string, unknown>
}

export interface ChatRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  seed?: number
  max_tokens?: number
  response_format?: { type: 'json_schema'; json_schema: JsonSchemaFormat }
}

export interface ChatResponse {
  choices: Array<{ message: { content: string | null } }>
  usage?: { prompt_tokens?: number; completion_tokens?: number }
}

export interface EmbeddingsRequest {
  model: string
  input: string
  /**
   * Dimension the provider must return. The ER contract is vector(768) and
   * some providers (Ollama with Qwen3-Embedding, OpenAI-compatible servers
   * with Matryoshka models) honor this parameter to truncate their native
   * vector. Without it, Ollama answers 1024 for qwen3-embedding:0.6b and the
   * contract check fails. Providers that ignore it keep failing loudly.
   */
  dimensions?: number
  /**
   * Asymmetric embedding models (NV-Embed-QA, E5, Nemotron 3.5 Embed) ask
   * for the role of the text: `query` or `passage`. Symmetric models reject
   * the parameter, so it is only sent when the installation configures it
   * (IA_EMBEDDING_INPUT_TYPE): the provider is data, not code.
   */
  input_type?: string
}

export interface EmbeddingsResponse {
  data: Array<{ embedding: number[] }>
  usage?: { prompt_tokens?: number; completion_tokens?: number }
}

export interface TokenUsageResult {
  inputTokens: number
  outputTokens: number
}

export function readUsage(
  usage: { prompt_tokens?: number; completion_tokens?: number } | undefined,
): TokenUsageResult | undefined {
  const inputTokens = usage?.prompt_tokens
  const outputTokens = usage?.completion_tokens
  if (inputTokens === undefined || outputTokens === undefined) return undefined
  return { inputTokens, outputTokens }
}

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504])
const BACKOFF_BASE_MS = 200
const MAX_ERROR_DETAIL_CHARS = 300

export class OpenAiCompatClient {
  constructor(
    readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly maxRetries: number,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  async chat(request: ChatRequest, signal: AbortSignal): Promise<ChatResponse> {
    return this.send<ChatResponse>('chat/completions', request, signal)
  }

  async embeddings(
    request: EmbeddingsRequest,
    signal: AbortSignal,
  ): Promise<EmbeddingsResponse> {
    return this.send<EmbeddingsResponse>('embeddings', request, signal)
  }

  private async send<T>(
    path: string,
    body: unknown,
    signal: AbortSignal,
  ): Promise<T> {
    const url = `${this.baseUrl}/${path}`
    const headers: Record<string, string> = {
      'content-type': 'application/json',
    }
    if (this.apiKey !== '') headers.authorization = `Bearer ${this.apiKey}`

    for (let attempt = 1; ; attempt++) {
      const response = await this.dispatch(url, headers, body, signal, path)
      if (response.ok) return (await response.json()) as T

      const detail = (await response.text().catch(() => '')).slice(
        0,
        MAX_ERROR_DETAIL_CHARS,
      )
      const retryable = RETRYABLE_STATUS.has(response.status)
      if (!retryable || attempt > this.maxRetries) {
        throw new EngineError(
          `IA provider rejected ${path} with HTTP ${response.status}: ${detail}`,
          path,
          response.status,
        )
      }
      await this.sleep(BACKOFF_BASE_MS * 2 ** (attempt - 1), signal, path)
    }
  }

  private async dispatch(
    url: string,
    headers: Record<string, string>,
    body: unknown,
    signal: AbortSignal,
    path: string,
  ): Promise<Response> {
    for (let attempt = 1; ; attempt++) {
      try {
        return await this.fetchImpl(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal,
        })
      } catch (error) {
        if (signal.aborted || attempt > this.maxRetries) {
          throw new EngineError(
            `IA transport failed for ${path}: ${error instanceof Error ? error.message : String(error)}`,
            path,
          )
        }
        await this.sleep(BACKOFF_BASE_MS * 2 ** (attempt - 1), signal, path)
      }
    }
  }

  private async sleep(
    delayMs: number,
    signal: AbortSignal,
    path: string,
  ): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, delayMs)
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer)
          reject(
            new EngineError(
              `IA call aborted by budget signal during backoff of ${path}`,
              path,
            ),
          )
        },
        { once: true },
      )
    })
  }
}
