// Shared database harness for the per-function specs in prisma/tests (issue
// #58). One scratch database (`docu_spec`) is dropped, recreated and migrated
// once per `bun test` run: bun test executes every spec file in the same
// process, so a module-level singleton avoids repeating the work. The scratch
// database is disposable by design; the database declared in DATABASE_URL is
// only used as the admin endpoint that creates it.
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { config as loadEnv } from 'dotenv'
import { Client } from 'pg'

// Under `bun test`, import.meta.url of imported modules is not a reliable file
// path, so the repo root is found by walking up from the working directory to
// the directory that owns bun.lock. CI has no .env file: dotenv misses and the
// DATABASE_URL of the environment is used instead.
function repoRoot(): string {
  let dir = process.cwd()
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, 'bun.lock'))) {
      return dir
    }
    dir = dirname(dir)
  }
  return process.cwd()
}

const rootDir = repoRoot()
const apiDir = join(rootDir, 'apps', 'api')
const prismaBin = join(apiDir, 'node_modules', '.bin', 'prisma')

loadEnv({ path: join(rootDir, '.env') })

const SCRATCH_DB = 'docu_spec'

export type PgConfig = {
  host: string
  port: number
  user: string
  password: string
  database: string
}

export type FacilitySeed = {
  facilityId: string
  workerId: string
  supervisorId: string
  familyIds: Record<string, string>
}

export type PlanSummary = {
  indexes: string[]
  seqScans: string[]
}

function databaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set (.env or environment)')
  }
  return url
}

// URL of the scratch database: the same admin endpoint declared in
// DATABASE_URL, with the database name swapped for the scratch one. Integration
// tests point the API's DATABASE_URL at this so the real PrismaService boots
// against an isolated, freshly migrated database.
export function specDatabaseUrl(): string {
  const target = new URL(databaseUrl())
  target.pathname = `/${SCRATCH_DB}`
  return target.toString()
}

function configFor(database: string): PgConfig {
  const parsed = new URL(databaseUrl())
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
  }
}

async function applyBaseline(target: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const proc = spawn(prismaBin, ['migrate', 'deploy'], {
      cwd: apiDir,
      env: { ...process.env, DATABASE_URL: target },
      stdio: 'pipe',
    })
    let output = ''
    proc.stdout.on('data', (chunk: Buffer) => {
      output += chunk.toString()
    })
    proc.stderr.on('data', (chunk: Buffer) => {
      output += chunk.toString()
    })
    proc.on('error', reject)
    proc.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(
        new Error(
          `prisma migrate deploy exited with ${code}: ${output.slice(-800)}`,
        ),
      )
    })
  })
}

let ready: Promise<Client> | null = null

// Returns the shared client against the freshly migrated scratch database.
// The first call pays the setup (drop, create, migrate); the rest reuse it.
export function getSpecDb(): Promise<Client> {
  ready ??= bootstrap()
  return ready
}

async function bootstrap(): Promise<Client> {
  const admin = new Client(configFor('postgres'))
  await admin.connect()
  try {
    await admin.query(`DROP DATABASE IF EXISTS ${SCRATCH_DB} WITH (FORCE)`)
    await admin.query(`CREATE DATABASE ${SCRATCH_DB}`)
  } finally {
    await admin.end()
  }
  const target = new URL(databaseUrl())
  target.pathname = `/${SCRATCH_DB}`
  await applyBaseline(target.toString())

  const client = new Client(configFor(SCRATCH_DB))
  await client.connect()
  return client
}

// Seeds one facility with two users and the requested document families.
// Every row gets fresh UUIDs, so spec files never collide with each other.
export async function seedFacility(
  client: Client,
  code: string,
  families: string[],
): Promise<FacilitySeed> {
  const facilityId = randomUUID()
  await client.query(
    `INSERT INTO "core"."facility" ("id", "code", "name", "timezone", "is_active")
     VALUES ($1, $2, $3, 'America/Mexico_City', true)`,
    [facilityId, code, `Spec ${code}`],
  )

  const workerId = randomUUID()
  const supervisorId = randomUUID()
  const users = [
    {
      id: workerId,
      username: 'operador',
      fullName: 'Operador de prueba',
      position: 'Operador',
    },
    {
      id: supervisorId,
      username: 'supervisor',
      fullName: 'Supervisor de prueba',
      position: 'Jefe',
    },
  ]
  for (const user of users) {
    await client.query(
      `INSERT INTO "core"."app_user"
         ("id", "facility_id", "username", "email", "full_name", "position",
          "relation_type", "scope", "status", "updated_at")
       VALUES ($1, $2, $3, $4, $5, $6, 'interno', 'instalacion', 'activo', now())`,
      [
        user.id,
        facilityId,
        user.username,
        `${code}.${user.username}@spec.invalid`,
        user.fullName,
        user.position,
      ],
    )
  }

  const familyIds: Record<string, string> = {}
  for (const family of families) {
    const id = randomUUID()
    familyIds[family] = id
    await client.query(
      `INSERT INTO "config"."family_config"
         ("id", "facility_id", "family_code", "name", "schema_definition",
          "parser_key", "is_ocr_required", "created_by_id", "updated_at")
       VALUES ($1, $2, $3, $4, '{"fields":[]}', 'spec.v1', false, $5, now())`,
      [id, facilityId, family, `Spec ${family}`, workerId],
    )
  }

  return { facilityId, workerId, supervisorId, familyIds }
}

export async function insertSourceFile(
  client: Client,
  seed: FacilitySeed,
  familyCode: string,
  originalName: string,
  sha256: string,
  receivedAt?: Date,
): Promise<string> {
  const id = randomUUID()
  await client.query(
    `INSERT INTO "ingest"."source_file"
       ("id", "facility_id", "family_config_id", "original_name", "sha256",
        "mime_type", "byte_size", "storage_path", "received_at", "received_by_id")
     VALUES ($1, $2, $3, $4, $5, 'application/pdf', 1024, $6,
             COALESCE($7::timestamptz, now()), $8)`,
    [
      id,
      seed.facilityId,
      seed.familyIds[familyCode],
      originalName,
      sha256,
      `originales/${originalName}`,
      receivedAt ?? null,
      seed.workerId,
    ],
  )
  return id
}

// Resolves with the pg error of a failing statement, or rejects if the
// statement unexpectedly succeeded.
export async function pgErrorOf(
  run: () => Promise<unknown>,
): Promise<{ code: string | undefined; message: string }> {
  try {
    await run()
  } catch (error) {
    const typed = error as { code?: string; message?: string }
    return { code: typed.code, message: typed.message ?? String(error) }
  }
  throw new Error('expected the statement to fail, but it succeeded')
}

type PlanNode = {
  'Node Type': string
  'Index Name'?: string
  Relation?: string
  Plan?: PlanNode
  Plans?: PlanNode[]
}

function walkPlan(node: PlanNode, acc: PlanSummary): void {
  if (node['Node Type'] === 'Seq Scan') {
    acc.seqScans.push(node.Relation ?? 'unknown')
  }
  if (node['Index Name']) {
    acc.indexes.push(node['Index Name'])
  }
  for (const child of node.Plans ?? []) {
    walkPlan(child, acc)
  }
}
// EXPLAIN with sequential scans disabled: if the query still answers, every
// access path is index-backed. This is the deterministic proxy for "fast at
// contract volume" (CONTRATO.md §8) that does not depend on CI timing.
export async function explainPlan(
  client: Client,
  sql: string,
  params: unknown[] = [],
): Promise<PlanSummary> {
  await client.query('BEGIN')
  await client.query('SET LOCAL enable_seqscan = OFF')
  const result = await client.query<{ 'QUERY PLAN': PlanNode[] }>(
    `EXPLAIN (FORMAT JSON) ${sql}`,
    params,
  )
  await client.query('ROLLBACK')
  const plan = result.rows[0]?.['QUERY PLAN']
  if (!plan || plan.length === 0) {
    throw new Error(`EXPLAIN returned no plan for: ${sql}`)
  }
  const root = plan[0]?.Plan
  if (!root) {
    throw new Error(`EXPLAIN plan has no root node for: ${sql}`)
  }
  const acc: PlanSummary = { indexes: [], seqScans: [] }
  walkPlan(root, acc)
  return acc
}

// Vector literal helpers: pgvector takes text like '[0.1,0.2,...]' and casts
// it to vector(768).
// Returns the first row of a result or throws: no silent undefined access.
export function firstRow<T>(rows: T[]): T {
  const row = rows.at(0)
  if (row === undefined) {
    throw new Error('expected at least one row, got none')
  }
  return row
}

export function vectorLiteral(values: number[]): string {
  return `[${values.map((value) => value.toFixed(6)).join(',')}]`
}

export function repeatingVector(pattern: number[], dimensions = 768): number[] {
  return Array.from(
    { length: dimensions },
    (_value, index) => pattern[index % pattern.length] ?? 0,
  )
}
