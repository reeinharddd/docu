/**
 * IA configuration from the environment (ADR-0020). Every value fails at
 * startup with an actionable message when invalid: the module never starts
 * half-configured. RNF-03 is enforced here: a remote endpoint requires
 * IA_NUBE_ACTIVADA=true.
 */
import { ConfigError } from './errors.js'

export interface IaConfig {
  baseUrl: string
  apiKey: string
  localActivated: boolean
  cloudActivated: boolean
  ocrModel: string
  llmModel: string
  embeddingModel: string
  seed: number
  temperature: number
  budgetMaxMs: number
  budgetMaxTokens: number
  maxRetries: number
  cacheEnabled: boolean
  cacheTtlMs: number
}

type Env = Record<string, string | undefined>

function readString(env: Env, key: string, fallback: string): string {
  const value = env[key]
  if (value === undefined || value.trim() === '') return fallback
  return value.trim()
}

function readBool(env: Env, key: string, fallback: boolean): boolean {
  const value = env[key]
  if (value === undefined || value.trim() === '') return fallback
  if (value === 'true') return true
  if (value === 'false') return false
  throw new ConfigError(`${key} must be 'true' or 'false', got '${value}'.`)
}

function readInt(env: Env, key: string, fallback: number, min: number): number {
  const value = env[key]
  if (value === undefined || value.trim() === '') return fallback
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed < min) {
    throw new ConfigError(
      `${key} must be an integer >= ${min}, got '${value}'.`,
    )
  }
  return parsed
}

function readFloat(
  env: Env,
  key: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const value = env[key]
  if (value === undefined || value.trim() === '') return fallback
  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed) || parsed < min || parsed > max) {
    throw new ConfigError(
      `${key} must be a number between ${min} and ${max}, got '${value}'.`,
    )
  }
  return parsed
}

/**
 * Local or private-network hosts (RNF-03): loopback, *.local, RFC1918
 * ranges and single-label hosts resolved inside the plant network.
 */
export function isLocalEndpoint(hostname: string): boolean {
  const host = hostname.toLowerCase()
  if (host === 'localhost' || host === '::1' || host.endsWith('.local'))
    return true
  if (/^127\./.test(host)) return true
  if (/^10\./.test(host)) return true
  if (/^192\.168\./.test(host)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true
  return !host.includes('.')
}

export function loadIaConfig(env: Env = process.env): IaConfig {
  const baseUrl = readString(
    env,
    'IA_API_BASE_URL',
    'http://localhost:11434/v1',
  )
  let endpoint: URL
  try {
    endpoint = new URL(baseUrl)
  } catch {
    throw new ConfigError(
      `IA_API_BASE_URL is not a valid URL: '${baseUrl}'. Example: http://localhost:11434/v1`,
    )
  }
  if (endpoint.protocol !== 'http:' && endpoint.protocol !== 'https:') {
    throw new ConfigError(`IA_API_BASE_URL must be http(s), got '${baseUrl}'.`)
  }
  const cloudActivated = readBool(env, 'IA_NUBE_ACTIVADA', false)
  if (!isLocalEndpoint(endpoint.hostname) && !cloudActivated) {
    throw new ConfigError(
      `IA_API_BASE_URL points to a remote host ('${endpoint.hostname}'). ` +
        'Outbound calls to a cloud provider require IA_NUBE_ACTIVADA=true with the lead authorization (RNF-03, IA.md §4). ' +
        'Keep IA_API_BASE_URL on the plant host (default http://localhost:11434/v1) or activate the cloud explicitly.',
    )
  }
  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    apiKey: readString(env, 'IA_API_KEY', ''),
    localActivated: readBool(env, 'IA_LOCAL_ACTIVADA', true),
    cloudActivated,
    ocrModel: readString(env, 'IA_OCR_MODEL', 'glm-ocr'),
    llmModel: readString(env, 'IA_LLM_MODEL', 'llama3.2'),
    embeddingModel: readString(
      env,
      'IA_EMBEDDING_MODEL',
      'qwen3-embedding-0.6b',
    ),
    seed: readInt(env, 'IA_SEED', 42, 0),
    temperature: readFloat(env, 'IA_TEMPERATURE', 0, 0, 2),
    budgetMaxMs: readInt(env, 'IA_BUDGET_MAX_MS', 30_000, 1),
    budgetMaxTokens: readInt(env, 'IA_BUDGET_MAX_TOKENS', 4_000, 1),
    maxRetries: readInt(env, 'IA_MAX_RETRIES', 2, 0),
    cacheEnabled: readBool(env, 'IA_CACHE_ENABLED', true),
    cacheTtlMs: readInt(env, 'IA_CACHE_TTL_MS', 3_600_000, 1),
  }
}
