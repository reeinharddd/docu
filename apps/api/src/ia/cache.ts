/**
 * Result cache keyed by content hash (brief #85): the same input with the
 * same engine and model never pays a second provider call. The store is
 * pluggable; the default is in-memory with TTL. Caching the same content
 * twice produces no drift: values are immutable outputs.
 */
import { createHash } from 'node:crypto'

export interface CacheStore {
  get(key: string): unknown | undefined
  set(key: string, value: unknown, ttlMs: number): void
}

export class MemoryCacheStore implements CacheStore {
  private readonly entries = new Map<
    string,
    { value: unknown; expiresAt: number }
  >()

  get(key: string): unknown | undefined {
    const entry = this.entries.get(key)
    if (!entry) return undefined
    if (entry.expiresAt < Date.now()) {
      this.entries.delete(key)
      return undefined
    }
    return entry.value
  }

  set(key: string, value: unknown, ttlMs: number): void {
    this.entries.set(key, { value, expiresAt: Date.now() + ttlMs })
  }
}

export function cacheKey(parts: readonly string[]): string {
  return createHash('sha256').update(parts.join('\u0000'), 'utf8').digest('hex')
}

export function sha256Hex(data: string | Uint8Array): string {
  return createHash('sha256').update(data).digest('hex')
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export class ResultCache {
  private hits = 0
  private misses = 0

  constructor(private readonly store: CacheStore | null) {}

  lookup<T>(key: string): T | undefined {
    if (!this.store) {
      this.misses++
      return undefined
    }
    const value = this.store.get(key)
    if (value === undefined) {
      this.misses++
      return undefined
    }
    this.hits++
    return value as T
  }

  save(key: string, value: unknown, ttlMs: number): void {
    if (this.store) this.store.set(key, value, ttlMs)
  }

  get stats(): { hits: number; misses: number } {
    return { hits: this.hits, misses: this.misses }
  }
}
