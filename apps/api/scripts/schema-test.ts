// DOCU C1 (#58) — schema tests.
//
// Applies the baseline migration to a scratch database and runs the SQL proofs
// (append-only tables, new family as data) plus the structural contract of the
// model: 25 tables, 2 views, 4 append-only triggers, 19 CHECK constraints, the
// pgvector extension and the HNSW vector index.
//
// The scratch database is created and left in place on purpose: this script
// never drops anything. CI runs on an ephemeral container, so nothing leaks.
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { Client } from 'pg'

loadEnv({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) })

const apiDir = fileURLToPath(new URL('..', import.meta.url))
const testsDir = fileURLToPath(new URL('../prisma/tests/', import.meta.url))
const prismaBin = fileURLToPath(
  new URL('../node_modules/.bin/prisma', import.meta.url),
)

const MODEL_SCHEMAS =
  "('core', 'ingest', 'graph', 'truth', 'config', 'platform')"
const EXPECTED_TABLES = 25
const EXPECTED_VIEWS = 2
const EXPECTED_CHECKS = 20
const EXPECTED_APPEND_ONLY = [
  'ingest.source_file',
  'truth.origin_history',
  'truth.audit_log',
  'platform.engram_ref',
]
const SQL_FILES = [
  'fixtures.sql',
  'solo_insert.sql',
  'new_family.sql',
  'isolation.sql',
]

type PgConfig = {
  host: string
  port: number
  user: string
  password: string
  database: string
}

function baseConfig(databaseUrl: string, database: string): PgConfig {
  const url = new URL(databaseUrl)
  return {
    host: url.hostname,
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
  }
}

function databaseUrlFor(databaseUrl: string, database: string): string {
  const url = new URL(databaseUrl)
  url.pathname = `/${database}`
  return url.toString()
}

async function createScratchDatabase(
  config: PgConfig,
  name: string,
): Promise<void> {
  const admin = new Client(config)
  await admin.connect()
  try {
    await admin.query(`CREATE DATABASE "${name}"`)
  } finally {
    await admin.end()
  }
}

async function applyBaseline(databaseUrl: string): Promise<void> {
  console.log('--- prisma migrate deploy (base limpia) ---')
  await new Promise<void>((resolve, reject) => {
    const proc = spawn(prismaBin, ['migrate', 'deploy'], {
      cwd: apiDir,
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'inherit',
    })
    proc.on('error', reject)
    proc.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`prisma migrate deploy exited with code ${code}`))
    })
  })
}

async function runSqlFile(client: Client, file: string): Promise<void> {
  const sql = readFileSync(`${testsDir}${file}`, 'utf8')
  await client.query(sql)
}

type CountRow = { count: string }

async function countOf(client: Client, sql: string): Promise<number> {
  const result = await client.query<CountRow>(sql)
  return Number(result.rows[0]?.count ?? '0')
}

async function checkStructure(client: Client): Promise<string[]> {
  const failures: string[] = []

  const tables = await countOf(
    client,
    `SELECT count(*)::text AS count FROM information_schema.tables
     WHERE table_schema IN ${MODEL_SCHEMAS} AND table_type = 'BASE TABLE'`,
  )
  if (tables !== EXPECTED_TABLES) {
    failures.push(`tablas: esperado ${EXPECTED_TABLES}, obtenido ${tables}`)
  }

  const views = await countOf(
    client,
    `SELECT count(*)::text AS count FROM pg_views WHERE schemaname IN ${MODEL_SCHEMAS}`,
  )
  if (views !== EXPECTED_VIEWS) {
    failures.push(`vistas: esperado ${EXPECTED_VIEWS}, obtenido ${views}`)
  }

  const checks = await countOf(
    client,
    `SELECT count(*)::text AS count FROM pg_constraint
     WHERE contype = 'c' AND connamespace::regnamespace::text IN ${MODEL_SCHEMAS}`,
  )
  if (checks !== EXPECTED_CHECKS) {
    failures.push(
      `CHECK constraints: esperado ${EXPECTED_CHECKS}, obtenido ${checks}`,
    )
  }

  for (const table of EXPECTED_APPEND_ONLY) {
    const triggers = await countOf(
      client,
      `SELECT count(*)::text AS count FROM pg_trigger
       WHERE NOT tgisinternal AND tgrelid = '${table}'::regclass AND tgname LIKE '%solo_insert%'`,
    )
    // 2 por tabla: el trigger por fila (UPDATE/DELETE) y el de statement
    // (TRUNCATE), que es la guardia que los triggers por fila no cubren.
    if (triggers !== 2) {
      failures.push(
        `${table}: esperado 2 triggers solo-insert (fila + TRUNCATE), obtenido ${triggers}`,
      )
    }
  }

  const extension = await client.query<{ extversion: string }>(
    "SELECT extversion FROM pg_extension WHERE extname = 'vector'",
  )
  if (!extension.rows[0]) {
    failures.push('extension vector: ausente')
  }

  const hnsw = await countOf(
    client,
    `SELECT count(*)::text AS count FROM pg_indexes
     WHERE indexname = 'memory_embedding_embedding_hnsw_idx' AND indexdef LIKE '%hnsw%'`,
  )
  if (hnsw !== 1) {
    failures.push(
      'indice HNSW de memory_embedding: ausente (Prisma 7.10 no modela Hnsw; si `prisma migrate dev` lo borro, hay que volver a anadirlo a mano)',
    )
  }

  return failures
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL no esta definido en .env')
  }

  const scratchName = `docu_schema_test_${Date.now()}`
  await createScratchDatabase(baseConfig(databaseUrl, 'postgres'), scratchName)
  const scratchUrl = databaseUrlFor(databaseUrl, scratchName)
  console.log(`Base scratch: ${scratchName}`)

  await applyBaseline(scratchUrl)

  const client = new Client(baseConfig(databaseUrl, scratchName))
  client.on('notice', (message) => {
    console.log(`  · ${message.message ?? ''}`)
  })
  await client.connect()
  try {
    for (const file of SQL_FILES) {
      console.log(`--- ${file} ---`)
      await runSqlFile(client, file)
    }
    console.log('--- contrato estructural ---')
    const failures = await checkStructure(client)
    if (failures.length > 0) {
      for (const failure of failures) {
        console.error(`FALLO: ${failure}`)
      }
      throw new Error(
        `${failures.length} comprobaciones estructurales fallaron`,
      )
    }
    console.log(
      'OK: 25 tablas, 2 vistas, 20 CHECK, 8 triggers solo-insert (4 fila + 4 TRUNCATE), extension vector, indice HNSW',
    )
  } finally {
    await client.end()
  }

  console.log(`schema-test OK (base scratch conservada: ${scratchName})`)
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
