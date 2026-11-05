#!/usr/bin/env bun
/**
 * dataset-check — validates the dataset contract and its reproducibility.
 *
 * 1. Schemas: every family in `dataset/config1/esquemas/` has a JSON Schema
 *    draft 2020-12 (object with properties), a valid example and an invalid
 *    one. The six families of the case cannot disappear by accident.
 * 2. Expectation: `dataset/config1/esperado.json` transcribes the approved
 *    volume of `docs/ingenieria/fichas/CONTRATO.md` §8 and §9. It must agree
 *    with the six schemas.
 * 3. Seed: `dataset/config1/semilla/semilla.json` is the versioned source of
 *    the generated corpus: with the same seed, the same documents come out.
 * 4. Manifest: `dataset/config1/manifiesto.sha256` lists the generated files
 *    with their SHA-256; every hash is verified against the file on disk and
 *    the count per family is checked against the expectation.
 *
 * The generated corpus is NOT versioned (dataset/config1/README.md): what
 * travels is the seed, the templates, the expectation and the manifest. Runs
 * in `bun run verify` and in CI.
 */
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const CONFIG = 'dataset/config1'
const SCHEMAS_DIR = join(CONFIG, 'esquemas')
const SEED_FILE = join(CONFIG, 'semilla', 'semilla.json')
const MANIFEST_FILE = join(CONFIG, 'manifiesto.sha256')
const EXPECTED_FILE = join(CONFIG, 'esperado.json')

const FAMILIES = [
  'excel_turno',
  'recepcion_rollo',
  'programa_planeacion',
  'inventario',
  'correo_hermana',
  'escaneado',
]

const findings: string[] = []

function finding(message: string): void {
  findings.push(message)
}

function readJson(path: string): unknown | null {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    finding(`${path}: invalid JSON (${(error as Error).message})`)
    return null
  }
}

function checkSchemas(): number {
  if (!existsSync(SCHEMAS_DIR)) {
    finding(`${SCHEMAS_DIR}: missing`)
    return 0
  }

  const files = readdirSync(SCHEMAS_DIR).filter((f) =>
    f.endsWith('.schema.json'),
  )
  const families = files.map((f) => f.replace(/\.schema\.json$/, ''))

  for (const family of FAMILIES) {
    if (!families.includes(family)) {
      finding(`${SCHEMAS_DIR}: missing schema for family '${family}'`)
    }
  }

  for (const family of families) {
    const schema = readJson(
      join(SCHEMAS_DIR, `${family}.schema.json`),
    ) as Record<string, unknown> | null
    if (schema) {
      const draft = String(schema.$schema ?? '')
      if (!draft.includes('2020-12')) {
        finding(`${family}.schema.json: missing draft 2020-12`)
      }
      if (schema.type !== 'object') {
        finding(`${family}.schema.json: root type must be 'object'`)
      }
      const props = schema.properties
      if (!props || typeof props !== 'object') {
        finding(`${family}.schema.json: missing 'properties'`)
      }
      if (!Array.isArray(schema.required)) {
        finding(`${family}.schema.json: missing 'required'`)
      }
    }

    for (const suffix of ['valido', 'invalido']) {
      const path = join(SCHEMAS_DIR, `${family}.${suffix}.json`)
      if (!existsSync(path)) {
        finding(`${path}: missing example`)
        continue
      }
      readJson(path)
    }
  }

  return families.length
}

type Expectation = {
  corpus: { root: string }
  files_per_family: Record<string, number>
  noise: { min: number; max: number }
  total_files: number
}

function checkExpectation(): Expectation | null {
  if (!existsSync(EXPECTED_FILE)) {
    finding(`${EXPECTED_FILE}: missing (the approved volume of CONTRATO.md §8)`)
    return null
  }
  const raw = readJson(EXPECTED_FILE) as Partial<Expectation> | null
  if (!raw) return null

  const filesPerFamily = raw.files_per_family
  const noise = raw.noise
  if (!filesPerFamily || typeof filesPerFamily !== 'object') {
    finding(`${EXPECTED_FILE}: missing 'files_per_family'`)
    return null
  }
  if (
    !noise ||
    typeof noise.min !== 'number' ||
    typeof noise.max !== 'number'
  ) {
    finding(`${EXPECTED_FILE}: missing 'noise' range`)
    return null
  }
  if (!raw.corpus || typeof raw.corpus.root !== 'string') {
    finding(`${EXPECTED_FILE}: missing 'corpus.root'`)
    return null
  }

  for (const family of FAMILIES) {
    const expected = filesPerFamily[family]
    if (typeof expected !== 'number') {
      finding(`${EXPECTED_FILE}: no count for family '${family}'`)
    }
  }
  for (const family of Object.keys(filesPerFamily)) {
    if (!FAMILIES.includes(family)) {
      finding(`${EXPECTED_FILE}: unknown family '${family}'`)
    }
  }

  const sum = FAMILIES.reduce(
    (acc, family) => acc + (filesPerFamily[family] ?? 0),
    0,
  )
  if (typeof raw.total_files === 'number' && raw.total_files !== sum) {
    finding(
      `${EXPECTED_FILE}: total_files is ${raw.total_files} but the families sum ${sum}`,
    )
  }

  return {
    corpus: raw.corpus,
    files_per_family: filesPerFamily,
    noise,
    total_files: raw.total_files ?? sum,
  }
}

function checkSeed(): boolean {
  if (!existsSync(SEED_FILE)) return false
  const seed = readJson(SEED_FILE) as Record<string, unknown> | null
  if (!seed) return true
  if (typeof seed.seed !== 'number') {
    finding(`${SEED_FILE}: missing 'seed' (number)`)
  }
  if (typeof seed.version !== 'string' || !seed.version) {
    finding(`${SEED_FILE}: missing 'version' (text)`)
  }
  const vocabulary = seed.vocabulary
  if (vocabulary && typeof vocabulary === 'object') {
    const names = (vocabulary as Record<string, unknown>).names
    if (!Array.isArray(names) || names.length === 0) {
      finding(`${SEED_FILE}: 'vocabulary.names' must be a non-empty list`)
    }
  }
  return true
}

function checkManifest(expectation: Expectation | null): number {
  if (!existsSync(MANIFEST_FILE)) return 0
  const lines = readFileSync(MANIFEST_FILE, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))

  if (lines.length === 0) {
    finding(`${MANIFEST_FILE}: manifest is empty`)
    return 0
  }

  const corpusRoot = expectation?.corpus.root ?? 'corpus'
  const counts = new Map<string, number>()
  let noise = 0
  let verified = 0

  for (const line of lines) {
    const parts = line.split(/\s+/)
    if (parts.length < 2) {
      finding(`${MANIFEST_FILE}: invalid line: ${line}`)
      continue
    }
    const [hash, ...rest] = parts
    const relative = rest.join(' ')
    const path = join(CONFIG, relative)
    if (!existsSync(path)) {
      finding(`${MANIFEST_FILE}: file '${path}' does not exist`)
      continue
    }
    const actual = createHash('sha256').update(readFileSync(path)).digest('hex')
    if (actual !== hash) {
      finding(
        `${MANIFEST_FILE}: hash of '${path}' does not match (not reproducible)`,
      )
      continue
    }
    verified++

    if (!relative.startsWith(`${corpusRoot}/`)) continue
    const family = relative.slice(corpusRoot.length + 1).split('/')[0]
    if (FAMILIES.includes(family)) {
      counts.set(family, (counts.get(family) ?? 0) + 1)
    } else {
      noise++
    }
  }

  if (expectation) {
    for (const family of FAMILIES) {
      const expected = expectation.files_per_family[family]
      const actual = counts.get(family) ?? 0
      if (typeof expected === 'number' && actual !== expected) {
        finding(
          `${MANIFEST_FILE}: family '${family}' has ${actual} file(s), expected ${expected} (CONTRATO.md §8)`,
        )
      }
    }
    if (noise < expectation.noise.min || noise > expectation.noise.max) {
      finding(
        `${MANIFEST_FILE}: ${noise} noise file(s), expected ${expectation.noise.min}-${expectation.noise.max} (CONTRATO.md §9)`,
      )
    }
  }

  return verified
}

const families = checkSchemas()
const expectation = checkExpectation()
const hasSeed = checkSeed()
const hashed = checkManifest(expectation)

if (existsSync(MANIFEST_FILE) && !hasSeed) {
  finding(
    `${SEED_FILE}: missing (the corpus cannot be reproducible without its seed)`,
  )
}

if (findings.length > 0) {
  console.log('dataset-check: findings')
  for (const item of findings) console.log(`  - ${item}`)
  console.log(`dataset: ${families} families, ${findings.length} finding(s)`)
  process.exit(1)
}

console.log(
  `dataset: ${families} families, expectation ok, seed ${
    hasSeed ? 'versioned' : 'pending'
  }, ${hashed} file(s) with verified hash, 0 findings`,
)
