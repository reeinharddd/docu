#!/usr/bin/env bun
/**
 * seed-check — the seed of the C1 installation declares the entity type of
 * every family (issue #135).
 *
 * The worker creates the proposal with the type the family declares in its
 * `schema_definition` (`entityType`); without it, `proposeEntity` returns null
 * and **nothing reaches the inbox**. The seed of C1 declared every family with
 * `{"fields":[]}`, so a fresh installation ingested the documents and never
 * proposed anything.
 *
 * What this gate checks:
 *
 * 1. The canonical map (`apps/api/prisma/seed/families.entity-type.json`) and
 *    the seed (`c1.sql`) declare the same type for the same family.
 * 2. Every declared type exists in `graph.entity_type` in the same seed: no
 *    new codes are invented per family.
 * 3. The seed converges: re-seeding a family that has no type fills it in
 *    (`ON CONFLICT ... DO UPDATE ... WHERE NOT (... ? 'entityType')`), and a
 *    family that already declares one is left alone.
 * 4. When the dataset seed exists (`dataset/config1/semilla/semilla.json`,
 *    issue #61), it declares the same type: the installation and the corpus
 *    do not drift apart.
 *
 * Runs in `bun run verify` and in CI. No database needed: it reads the seed.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const SEED_DIR = join('apps', 'api', 'prisma', 'seed')
const SEED_FILE = join(SEED_DIR, 'c1.sql')
const MAP_FILE = join(SEED_DIR, 'families.entity-type.json')
const DATASET_SEED_FILE = join('dataset', 'config1', 'semilla', 'semilla.json')

const findings: string[] = []

function finding(message: string): void {
  findings.push(message)
}

type FamilyMap = {
  familyCode: string
  name: string
  entityType: string
}

type CanonicalMap = {
  families: FamilyMap[]
}

function readCanonicalMap(): CanonicalMap | null {
  if (!existsSync(MAP_FILE)) {
    finding(`${MAP_FILE}: missing (the canonical family -> entity type map)`)
    return null
  }
  const parsed = JSON.parse(readFileSync(MAP_FILE, 'utf8')) as CanonicalMap
  if (!Array.isArray(parsed.families) || parsed.families.length === 0) {
    finding(`${MAP_FILE}: no families declared`)
    return null
  }
  return parsed
}

/** The VALUES rows of an INSERT of c1.sql, parsed by shape. */
function insertRows(
  sql: string,
  schema: string,
  table: string,
  rowPattern: RegExp,
): string[][] {
  const marker = `INSERT INTO "${schema}"."${table}"`
  const start = sql.indexOf(marker)
  if (start === -1) return []
  const valuesAt = sql.indexOf('VALUES', start)
  if (valuesAt === -1) return []
  const end = sql.indexOf('ON CONFLICT', valuesAt)
  const block = sql.slice(valuesAt, end === -1 ? undefined : end)
  const rows: string[][] = []
  for (const match of block.matchAll(rowPattern)) {
    rows.push(match.slice(1).map((value) => value ?? ''))
  }
  return rows
}

// family_config: id, facility, family_code, name, schema_definition,
// parser_key, is_ocr_required, created_by_id, updated_at.
const FAMILY_ROW =
  /\(\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(true|false),\s*'([^']*)',\s*now\(\)\s*\)/g

// entity_type: id, facility, code, name, schema_definition, created_by_id,
// updated_at.
const ENTITY_TYPE_ROW =
  /\(\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*now\(\)\s*\)/g

/** The entity types the seed creates: code -> name. */
function seededEntityTypes(sql: string): Map<string, string> {
  const types = new Map<string, string>()
  for (const row of insertRows(sql, 'graph', 'entity_type', ENTITY_TYPE_ROW)) {
    const code = row[2]
    const name = row[3]
    if (code) types.set(code, name)
  }
  return types
}

/** The families the seed declares: familyCode -> schema_definition. */
function seededFamilies(sql: string): Map<string, string> {
  const families = new Map<string, string>()
  for (const row of insertRows(sql, 'config', 'family_config', FAMILY_ROW)) {
    const familyCode = row[2]
    const schemaDefinition = row[4]
    if (familyCode) families.set(familyCode, schemaDefinition)
  }
  return families
}

/**
 * The type a family declares, read the same way the worker reads it
 * (`ingest.processor.ts`): the `entityType` key of the schema definition.
 */
function declaredEntityType(schemaDefinition: string): string | null {
  try {
    const parsed = JSON.parse(schemaDefinition) as { entityType?: unknown }
    return typeof parsed.entityType === 'string' &&
      parsed.entityType.trim() !== ''
      ? parsed.entityType
      : null
  } catch {
    return null
  }
}

/**
 * The family -> type pairs declared by the dataset seed, wherever they sit in
 * the JSON. The shape is the one recommended to the dataset lane (#61); a
 * seed that declares nothing is not an error here (the dataset is still
 * pending), but a seed that declares a different type is.
 */
function datasetEntityTypes(
  value: unknown,
  knownFamilies: Set<string>,
  found: Map<string, string> = new Map(),
): Map<string, string> {
  if (Array.isArray(value)) {
    for (const item of value) datasetEntityTypes(item, knownFamilies, found)
    return found
  }
  if (typeof value !== 'object' || value === null) return found

  const record = value as Record<string, unknown>
  const codeKey = ['familyCode', 'family_code', 'familia'].find(
    (key) => typeof record[key] === 'string',
  )
  const typeKey = [
    'entityType',
    'entity_type',
    'entityTypeCode',
    'tipo_entidad',
  ].find((key) => typeof record[key] === 'string')
  if (codeKey && typeKey) {
    const familyCode = record[codeKey] as string
    if (knownFamilies.has(familyCode)) {
      found.set(familyCode, record[typeKey] as string)
    }
  }
  // The other shape: { "excel_turno": { "entityType": "shift" } }
  for (const [key, nested] of Object.entries(record)) {
    if (!knownFamilies.has(key)) continue
    if (typeof nested !== 'object' || nested === null) continue
    const nestedRecord = nested as Record<string, unknown>
    const nestedType = [
      'entityType',
      'entity_type',
      'entityTypeCode',
      'tipo_entidad',
    ].find((nestedKey) => typeof nestedRecord[nestedKey] === 'string')
    if (nestedType) found.set(key, nestedRecord[nestedType] as string)
  }
  for (const nested of Object.values(record)) {
    datasetEntityTypes(nested, knownFamilies, found)
  }
  return found
}

const seedSql = readFileSync(SEED_FILE, 'utf8')
const canonical = readCanonicalMap()
const seededFamiliesMap = seededFamilies(seedSql)
const entityTypes = seededEntityTypes(seedSql)

if (canonical) {
  for (const family of canonical.families) {
    const schemaDefinition = seededFamiliesMap.get(family.familyCode)
    if (schemaDefinition === undefined) {
      finding(
        `${SEED_FILE}: family ${family.familyCode} is not seeded (the canonical map declares it)`,
      )
      continue
    }
    const declared = declaredEntityType(schemaDefinition)
    if (declared === null) {
      finding(
        `${SEED_FILE}: family ${family.familyCode} declares no entityType: its proposal never reaches the inbox (#135)`,
      )
      continue
    }
    if (declared !== family.entityType) {
      finding(
        `${SEED_FILE}: family ${family.familyCode} declares entityType ${declared}, the canonical map says ${family.entityType}`,
      )
    }
    if (!entityTypes.has(declared)) {
      finding(
        `${SEED_FILE}: family ${family.familyCode} declares entityType ${declared}, which the seed does not create in graph.entity_type`,
      )
    }
  }

  for (const familyCode of seededFamiliesMap.keys()) {
    if (
      !canonical.families.some((family) => family.familyCode === familyCode)
    ) {
      finding(
        `${SEED_FILE}: family ${familyCode} is seeded but the canonical map does not declare it`,
      )
    }
  }
}

// The seed must converge: a family seeded without a type has to receive it
// when the installation is seeded again.
if (!/ON CONFLICT \("id"\) DO UPDATE[\s\S]*?\? 'entityType'/.test(seedSql)) {
  finding(
    `${SEED_FILE}: the family insert does not converge (no ON CONFLICT ... DO UPDATE that fills a missing entityType): re-seeding an installation would not repair it`,
  )
}

if (existsSync(DATASET_SEED_FILE)) {
  const knownFamilies = new Set(
    (canonical?.families ?? []).map((family) => family.familyCode),
  )
  const datasetSeed = JSON.parse(
    readFileSync(DATASET_SEED_FILE, 'utf8'),
  ) as unknown
  const declared = datasetEntityTypes(datasetSeed, knownFamilies)
  for (const family of canonical?.families ?? []) {
    const datasetType = declared.get(family.familyCode)
    if (datasetType !== undefined && datasetType !== family.entityType) {
      finding(
        `${DATASET_SEED_FILE}: family ${family.familyCode} declares entityType ${datasetType}, the canonical map says ${family.entityType}`,
      )
    }
  }
}

if (findings.length > 0) {
  console.log('seed-check: findings')
  for (const item of findings) console.log(`  - ${item}`)
  console.log(`seed: ${findings.length} finding(s)`)
  process.exit(1)
}

console.log(
  `seed: ${canonical?.families.length ?? 0} families declare their entity type (${entityTypes.size} entity types in the seed)`,
)
