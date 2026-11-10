/**
 * IA module spec (brief #85, ADR-0020). Offline: transport is a scripted
 * double inside this spec (a test bench for the client, not a product
 * engine). Integration against the configured endpoint runs only with
 * IA_LIVE_TEST=1 and real models — never a simulated engine in the product.
 */
import { describe, expect, test } from 'bun:test'
import { MemoryCacheStore } from './cache.js'
import type { IaConfig } from './config.js'
import { loadIaConfig } from './config.js'
import { ContractViolationError } from './errors.js'
import { IaRunner } from './ia-runner.js'
import {
  type ChatResponse,
  type EmbeddingsResponse,
  type FetchLike,
  OpenAiCompatClient,
} from './openai-client.js'
import { classifyScore } from './scoring.js'

const neverFetch: FetchLike = () => {
  throw new Error('the provider must not be called in this test')
}

const CONFIG: IaConfig = {
  baseUrl: 'http://provider.test/v1',
  apiKey: 'secret-key',
  localActivated: true,
  cloudActivated: false,
  ocrModel: 'glm-ocr',
  llmModel: 'llama3.2',
  embeddingModel: 'qwen3-embedding-0.6b',
  scoringUrl: 'http://scorer.test/v1/systemone',
  scoringAutoThreshold: 0.9,
  scoringReviewThreshold: 0.6,
  seed: 42,
  temperature: 0,
  budgetMaxMs: 30_000,
  budgetMaxTokens: 4_000,
  maxRetries: 2,
  cacheEnabled: true,
  cacheTtlMs: 60_000,
}

function chatResponse(content: string): ChatResponse {
  return {
    choices: [{ message: { content } }],
    usage: { prompt_tokens: 12, completion_tokens: 34 },
  }
}

function embeddingsResponse(vector: number[]): EmbeddingsResponse {
  return {
    data: [{ embedding: vector }],
    usage: { prompt_tokens: 5, completion_tokens: 0 },
  }
}

function scriptedFetch(
  script: Array<(url: string, init: RequestInit) => Response>,
): { fetch: FetchLike; calls: Array<{ url: string; init: RequestInit }> } {
  const calls: Array<{ url: string; init: RequestInit }> = []
  return {
    calls,
    fetch: (url, init) => {
      const handler = script.shift()
      calls.push({ url, init })
      if (handler === undefined)
        throw new Error('scriptedFetch: no scripted response left')
      return Promise.resolve(handler(url, init))
    },
  }
}

function runnerWith(
  fetch: FetchLike,
  overrides: Partial<IaConfig> = {},
  scoringFetch?: FetchLike,
): IaRunner {
  const config: IaConfig = { ...CONFIG, ...overrides }
  return new IaRunner({
    config,
    client: new OpenAiCompatClient(
      config.baseUrl,
      config.apiKey,
      config.maxRetries,
      fetch,
    ),
    cacheStore: new MemoryCacheStore(),
    ...(scoringFetch === undefined ? {} : { scoringFetch }),
  })
}

describe('IA configuration', () => {
  test('defaults are local and offline-safe', () => {
    const config = loadIaConfig({})
    expect(config.baseUrl).toBe('http://localhost:11434/v1')
    expect(config.ocrModel).toBe('glm-ocr')
    expect(config.llmModel).toBe('llama3.2')
    expect(config.embeddingModel).toBe('qwen3-embedding-0.6b')
    expect(config.temperature).toBe(0)
    expect(config.cloudActivated).toBe(false)
  })

  test('remote endpoint without IA_NUBE_ACTIVADA=true fails at startup (RNF-03)', () => {
    expect(() =>
      loadIaConfig({ IA_API_BASE_URL: 'https://integrate.api.nvidia.com/v1' }),
    ).toThrow(/IA_NUBE_ACTIVADA/)
  })

  test('remote endpoint with IA_NUBE_ACTIVADA=true is allowed', () => {
    const config = loadIaConfig({
      IA_API_BASE_URL: 'https://integrate.api.nvidia.com/v1',
      IA_NUBE_ACTIVADA: 'true',
    })
    expect(config.cloudActivated).toBe(true)
  })

  test('malformed integers fail naming the variable', () => {
    expect(() => loadIaConfig({ IA_BUDGET_MAX_MS: 'soon' })).toThrow(
      /IA_BUDGET_MAX_MS/,
    )
  })

  test('malformed booleans fail naming the variable', () => {
    expect(() => loadIaConfig({ IA_CACHE_ENABLED: 'yes' })).toThrow(
      /IA_CACHE_ENABLED/,
    )
  })
})

describe('IA transport and engines', () => {
  test('llm builds a structured-output chat request with credentials', async () => {
    const { fetch, calls } = scriptedFetch([
      () => Response.json(chatResponse('{"familia":"excel_turno"}')),
    ])
    const runner = runnerWith(fetch)
    const output = await runner.complete({
      system: 'Eres un clasificador.',
      prompt: 'Clasifica el archivo.',
      jsonSchema: { name: 'familia', schema: { type: 'object' } },
    })
    expect(output.json).toEqual({ familia: 'excel_turno' })
    expect(calls).toHaveLength(1)
    expect(calls[0]?.url).toBe('http://provider.test/v1/chat/completions')
    const headers = calls[0]?.init.headers as Record<string, string>
    expect(headers.authorization).toBe('Bearer secret-key')
    const body = JSON.parse(String(calls[0]?.init.body)) as {
      model: string
      temperature: number
      seed: number
      response_format?: { type: string }
    }
    expect(body.model).toBe('llama3.2')
    expect(body.temperature).toBe(0)
    expect(body.seed).toBe(42)
    expect(body.response_format?.type).toBe('json_schema')
    const trace = runner.snapshot()[0]
    expect(trace?.inputTokens).toBe(12)
    expect(trace?.outputTokens).toBe(34)
  })

  test('retries a 500 and succeeds within maxRetries', async () => {
    const { fetch, calls } = scriptedFetch([
      () => Response.json({ error: 'boom' }, { status: 500 }),
      () => Response.json(chatResponse('{"ok":true}')),
    ])
    const runner = runnerWith(fetch)
    const output = await runner.complete({ system: 's', prompt: 'p' })
    expect(output.json).toEqual({ ok: true })
    expect(calls).toHaveLength(2)
  })

  test('does not retry a contract rejection (4xx)', async () => {
    const { fetch, calls } = scriptedFetch([
      () => Response.json({ error: 'bad model' }, { status: 400 }),
    ])
    const runner = runnerWith(fetch)
    expect(runner.complete({ system: 's', prompt: 'p' })).rejects.toThrow(
      'HTTP 400',
    )
    expect(calls).toHaveLength(1)
  })

  test('caches by content hash: the second identical call pays nothing', async () => {
    const { fetch, calls } = scriptedFetch([
      () => Response.json(chatResponse('{"n":1}')),
    ])
    const runner = runnerWith(fetch)
    await runner.complete({ system: 's', prompt: 'same' })
    const second = await runner.complete({ system: 's', prompt: 'same' })
    expect(second.json).toEqual({ n: 1 })
    expect(calls).toHaveLength(1)
    expect(runner.cacheStats).toEqual({ hits: 1, misses: 1 })
    const trace = runner.snapshot()[1]
    expect(trace?.cached).toBe(true)
  })

  test('budget cuts an oversized call before it reaches the provider', async () => {
    const { fetch, calls } = scriptedFetch([])
    const runner = runnerWith(fetch, { budgetMaxTokens: 10 })
    expect(
      runner.complete({ system: 's', prompt: 'x'.repeat(100) }),
    ).rejects.toThrow(/IA_BUDGET_MAX_TOKENS/)
    expect(calls).toHaveLength(0)
    const trace = runner.snapshot()[0]
    expect(trace?.budgetCut).toBe(true)
  })

  test('embedding dimension contract is enforced (vector(768))', async () => {
    const { fetch } = scriptedFetch([
      () => Response.json(embeddingsResponse([0.1, 0.2, 0.3])),
    ])
    const runner = runnerWith(fetch)
    const failure = runner.embed('texto')
    expect(failure).rejects.toThrow(ContractViolationError)
    expect(failure).rejects.toThrow(/768/)
  })

  test('ocr sends the page as a base64 data URI and rejects empty input', async () => {
    const { fetch, calls } = scriptedFetch([
      () => Response.json(chatResponse('texto extraído')),
    ])
    const runner = runnerWith(fetch)
    const output = await runner.recognizeDocument({
      bytes: new TextEncoder().encode('fake-bytes'),
      mimeType: 'image/png',
    })
    expect(output.text).toBe('texto extraído')
    const body = JSON.parse(String(calls[0]?.init.body)) as {
      messages: Array<{
        content: Array<{ type: string; image_url?: { url: string } }>
      }>
    }
    const image = body.messages[0]?.content.find(
      (part) => part.type === 'image_url',
    )
    expect(image?.image_url?.url.startsWith('data:image/png;base64,')).toBe(
      true,
    )
    expect(
      runner.recognizeDocument({
        bytes: new Uint8Array(),
        mimeType: 'image/png',
      }),
    ).rejects.toThrow(/no bytes/)
  })

  test('non-JSON llm output is an engine error, not a silent pass', async () => {
    const { fetch } = scriptedFetch([
      () => Response.json(chatResponse('texto libre')),
    ])
    const runner = runnerWith(fetch)
    const failure = runner.complete({ system: 's', prompt: 'p' })
    expect(failure).rejects.toThrow(/non-JSON/)
  })
})

describe('IA scoring (SystemOne / Laya)', () => {
  const FAMILIES = ['programa_planeacion', 'recepcion_rollo', 'inventario']

  test('sends input and labels to the SystemOne endpoint and maps the verdict', async () => {
    const scoringFetch = ((url: string, init: RequestInit) => {
      expect(url).toBe('http://scorer.test/v1/systemone')
      const body = JSON.parse(String(init.body)) as {
        input: string
        labels: string[]
      }
      expect(body.input).toContain('R-017')
      expect(body.labels).toEqual([...FAMILIES])
      return Promise.resolve(
        Response.json({ label: 'recepcion_rollo', confidence: 0.94 }),
      )
    }) as FetchLike
    const runner = runnerWith(
      neverFetch,
      {
        scoringUrl: 'http://scorer.test/v1/systemone',
      },
      scoringFetch,
    )
    const verdict = await runner.score({
      text: 'Rollo R-017 recibido',
      candidates: FAMILIES,
    })
    expect(verdict).toEqual({ label: 'recepcion_rollo', confidence: 0.94 })
  })

  test('rejects a label outside the candidate set (no invented families)', async () => {
    const scoringFetch = (() =>
      Promise.resolve(
        Response.json({ label: 'familia_inventada', confidence: 0.9 }),
      )) as FetchLike
    const runner = runnerWith(neverFetch, {}, scoringFetch)
    expect(runner.score({ text: 'x', candidates: FAMILIES })).rejects.toThrow(
      /outside the candidate set/,
    )
  })

  test('rejects a verdict without a calibrated shape', async () => {
    const scoringFetch = (() =>
      Promise.resolve(
        Response.json({ label: 'inventario', confidence: 1.5 }),
      )) as FetchLike
    const runner = runnerWith(neverFetch, {}, scoringFetch)
    expect(runner.score({ text: 'x', candidates: FAMILIES })).rejects.toThrow(
      /SystemOne contract/,
    )
  })

  test('thresholds classify the cascade (IA.md §3)', () => {
    expect(classifyScore(0.95, 0.9, 0.6)).toBe('automatic')
    expect(classifyScore(0.75, 0.9, 0.6)).toBe('review')
    expect(classifyScore(0.3, 0.9, 0.6)).toBe('quarantine')
  })
})

describe('IA live integration (IA_LIVE_TEST=1)', () => {
  test.skipIf(process.env.IA_LIVE_TEST !== '1')(
    'embeds a real text at the configured endpoint within the 768 contract',
    async () => {
      const runner = new IaRunner()
      const output = await runner.embed('Rollo R-017 recibido en recepción')
      expect(output.vector).toHaveLength(768)
      const trace = runner.snapshot()[0]
      expect(trace?.cached).toBe(false)
      expect(trace?.error).toBeUndefined()
    },
  )
})
