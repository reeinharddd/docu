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
  ocrBaseUrl: 'http://provider.test/v1',
  llmBaseUrl: 'http://provider.test/v1',
  embeddingBaseUrl: 'http://provider.test/v1',
  ocrApiKey: 'secret-key',
  llmApiKey: 'secret-key',
  embeddingApiKey: 'secret-key',
  embeddingInputType: '',
  localActivated: true,
  cloudActivated: false,
  ocrModel: 'glm-ocr',
  llmModel: 'llama3.2',
  embeddingModel: 'qwen3-embedding:0.6b',
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
    expect(config.embeddingModel).toBe('qwen3-embedding:0.6b')
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

describe('IA provider per capability', () => {
  test('a capability can point to its own provider, the others keep the default', () => {
    const config = loadIaConfig({
      IA_API_BASE_URL: 'http://localhost:11434/v1',
      IA_LLM_API_BASE_URL: 'https://integrate.api.nvidia.com/v1',
      IA_LLM_API_KEY: 'cloud-key',
      IA_NUBE_ACTIVADA: 'true',
    })
    expect(config.ocrBaseUrl).toBe('http://localhost:11434/v1')
    expect(config.embeddingBaseUrl).toBe('http://localhost:11434/v1')
    expect(config.llmBaseUrl).toBe('https://integrate.api.nvidia.com/v1')
    expect(config.llmApiKey).toBe('cloud-key')
    expect(config.ocrApiKey).toBe('')
  })

  test('a remote capability without IA_NUBE_ACTIVADA=true fails at startup (RNF-03)', () => {
    expect(() =>
      loadIaConfig({
        IA_API_BASE_URL: 'http://localhost:11434/v1',
        IA_LLM_API_BASE_URL: 'https://integrate.api.nvidia.com/v1',
      }),
    ).toThrow(/IA_LLM_API_BASE_URL[\s\S]*IA_NUBE_ACTIVADA/)
  })

  test('the central model goes to its provider while the OCR stays on the plant host', async () => {
    const { fetch, calls } = scriptedFetch([
      () => Response.json(chatResponse('{"familia":"excel_turno"}')),
      () =>
        Response.json({
          choices: [{ message: { content: 'texto de la pagina' } }],
        }),
    ])
    const runner = new IaRunner({
      config: {
        ...CONFIG,
        baseUrl: 'http://localhost:11434/v1',
        ocrBaseUrl: 'http://localhost:11434/v1',
        llmBaseUrl: 'https://integrate.api.nvidia.com/v1',
        embeddingBaseUrl: 'http://localhost:11434/v1',
        apiKey: '',
        llmApiKey: 'cloud-key',
        ocrApiKey: '',
        embeddingApiKey: '',
      },
      fetchImpl: fetch,
      cacheStore: new MemoryCacheStore(),
    })
    await runner.complete({
      system: 'Eres un clasificador.',
      prompt: 'Clasifica el archivo.',
    })
    await runner.recognizeDocument({
      bytes: new Uint8Array([1, 2, 3]),
      mimeType: 'image/png',
    })
    expect(calls[0]?.url).toBe(
      'https://integrate.api.nvidia.com/v1/chat/completions',
    )
    expect(calls[1]?.url).toBe('http://localhost:11434/v1/chat/completions')
    const headers = calls[0]?.init.headers as Record<string, string>
    expect(headers.authorization).toBe('Bearer cloud-key')
    const localHeaders = calls[1]?.init.headers as Record<string, string>
    expect(localHeaders.authorization).toBeUndefined()
  })

  test('the embedding engine sends the configured input_type only when there is one', async () => {
    const { fetch, calls } = scriptedFetch([
      () => Response.json(embeddingsResponse(new Array(768).fill(0.1))),
    ])
    const runner = new IaRunner({
      config: { ...CONFIG, embeddingInputType: 'query' },
      fetchImpl: fetch,
      cacheStore: new MemoryCacheStore(),
    })
    await runner.embed('Rollo R-017')
    const body = JSON.parse(String(calls[0]?.init.body)) as {
      input_type?: string
      dimensions?: number
    }
    expect(body.input_type).toBe('query')
    expect(body.dimensions).toBe(768)
  })

  test('a symmetric provider does not receive input_type', async () => {
    const { fetch, calls } = scriptedFetch([
      () => Response.json(embeddingsResponse(new Array(768).fill(0.1))),
    ])
    const runner = new IaRunner({
      config: { ...CONFIG, embeddingInputType: '' },
      fetchImpl: fetch,
      cacheStore: new MemoryCacheStore(),
    })
    await runner.embed('Rollo R-017')
    const body = JSON.parse(String(calls[0]?.init.body)) as {
      input_type?: string
    }
    expect(body.input_type).toBeUndefined()
  })

  test('the cache does not serve one provider the answer of another', async () => {
    const { fetch, calls } = scriptedFetch([
      () => Response.json(chatResponse('{"familia":"de_la_nube"}')),
      () => Response.json(chatResponse('{"familia":"de_la_planta"}')),
    ])
    const request = {
      system: 'Eres un clasificador.',
      prompt: 'Clasifica el archivo.',
    }
    const cloud = new IaRunner({
      config: { ...CONFIG, llmBaseUrl: 'https://cloud.test/v1' },
      fetchImpl: fetch,
      cacheStore: new MemoryCacheStore(),
    })
    const plant = new IaRunner({
      config: { ...CONFIG, llmBaseUrl: 'http://plant.test/v1' },
      fetchImpl: fetch,
      cacheStore: new MemoryCacheStore(),
    })
    expect((await cloud.complete(request)).json).toEqual({
      familia: 'de_la_nube',
    })
    expect((await plant.complete(request)).json).toEqual({
      familia: 'de_la_planta',
    })
    expect(calls).toHaveLength(2)
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

  test('embedding request asks the provider for the contracted dimension', async () => {
    const { fetch, calls } = scriptedFetch([
      () => Response.json(embeddingsResponse(new Array(768).fill(0.1))),
    ])
    const runner = runnerWith(fetch)
    const output = await runner.embed('texto')
    expect(output.vector).toHaveLength(768)
    const body = JSON.parse(String(calls[0]?.init.body)) as {
      model: string
      input: string
      dimensions?: number
    }
    expect(body.dimensions).toBe(768)
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

/**
 * Live battery against the configured endpoint (IA_LIVE_TEST=1).
 *
 * These tests measure the engines, not the production budget: they run with a
 * generous budget and a long timeout, because a local model on CPU answers in
 * seconds. The production budget (IA_BUDGET_MAX_TOKENS) is a different
 * question, measured in #136.
 */
function liveRunner(overrides: Partial<IaConfig> = {}): IaRunner {
  const config: IaConfig = {
    ...loadIaConfig(),
    budgetMaxTokens: 200_000,
    budgetMaxMs: 120_000,
    ...overrides,
  }
  return new IaRunner({ config })
}

describe('IA live integration (IA_LIVE_TEST=1)', () => {
  test.skipIf(process.env.IA_LIVE_TEST !== '1')(
    'embeds a real text at the configured endpoint within the 768 contract',
    async () => {
      const runner = liveRunner()
      const output = await runner.embed('Rollo R-017 recibido en recepción')
      expect(output.vector).toHaveLength(768)
      const trace = runner.snapshot()[0]
      expect(trace?.cached).toBe(false)
      expect(trace?.error).toBeUndefined()
    },
    120_000,
  )

  test.skipIf(process.env.IA_LIVE_TEST !== '1')(
    'reads a real page with the configured vision model',
    async () => {
      const runner = liveRunner()
      const bytes = new Uint8Array(
        await Bun.file(
          new URL('./fixtures/muestra-1p.png', import.meta.url),
        ).arrayBuffer(),
      )
      const output = await runner.recognizeDocument({
        bytes,
        mimeType: 'image/png',
      })
      expect(output.text.trim().length).toBeGreaterThan(10)
      const trace = runner.snapshot()[0]
      expect(trace?.error).toBeUndefined()
    },
    180_000,
  )

  test.skipIf(process.env.IA_LIVE_TEST !== '1')(
    'answers with the configured chat model in the requested JSON shape',
    async () => {
      const runner = liveRunner()
      const output = await runner.complete({
        system: 'Eres un clasificador de documentos.',
        prompt:
          'Clasifica el siguiente texto en una de las familias: excel_turno, recepcion_rollo, inventario, correo_hermana, escaneado, programa_planeacion.\nTexto: Rollo R-017 recibido en recepción el lunes 12 de octubre.',
        jsonSchema: {
          name: 'clasificacion',
          schema: {
            type: 'object',
            properties: {
              familia: { type: 'string' },
            },
            required: ['familia'],
            additionalProperties: false,
          },
        },
      })
      expect(output.json).toBeDefined()
      const trace = runner.snapshot()[0]
      expect(trace?.error).toBeUndefined()
    },
    180_000,
  )
})
