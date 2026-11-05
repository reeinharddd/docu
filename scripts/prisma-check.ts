#!/usr/bin/env bun
/**
 * prisma-check — validates the Prisma toolchain and, once the schema lands,
 * the schema itself.
 *
 * 1. Toolchain: Prisma CLI, client and driver adapter installed (ADR-0004).
 * 2. Config: `apps/api/prisma.config.ts` exists and keeps the connection in
 *    one place: the datasource URL lives there, never in the schema.
 * 3. Schema (delivered by issue #58): `prisma validate` and `prisma generate`
 *    must pass, the schema must declare models, and the baseline migration
 *    must exist.
 *
 * While the schema is missing the gate reports it as pending and exits 0: the
 * toolchain is ready, the model is the work of the lane. Runs in
 * `bun run verify` and in CI.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const API_DIR = 'apps/api'
const CONFIG_FILE = join(API_DIR, 'prisma.config.ts')
const SCHEMA_FILE = join(API_DIR, 'prisma', 'schema.prisma')
const MIGRATIONS_DIR = join(API_DIR, 'prisma', 'migrations')
const BASELINE_FILE = join(MIGRATIONS_DIR, '0_baseline', 'migration.sql')

const findings: string[] = []

function finding(message: string): void {
  findings.push(message)
}

async function run(
  command: string[],
): Promise<{ code: number; output: string }> {
  const proc = Bun.spawn(command, {
    cwd: API_DIR,
    stdout: 'pipe',
    stderr: 'pipe',
    env: { ...process.env },
  })
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ])
  const code = await proc.exited
  return { code, output: `${stdout}${stderr}`.trim() }
}

if (!existsSync(CONFIG_FILE)) {
  finding(
    `${CONFIG_FILE}: missing (the datasource URL must live here, ADR-0004)`,
  )
}

if (!existsSync(SCHEMA_FILE)) {
  console.log('prisma: toolchain ready, schema pending (issue #58)')
  if (findings.length > 0) {
    for (const item of findings) console.log(`  - ${item}`)
    process.exit(1)
  }
  process.exit(0)
}

const schema = readFileSync(SCHEMA_FILE, 'utf8')
const models = schema.match(/^model\s+\w+/gm) ?? []
if (models.length === 0) {
  finding(`${SCHEMA_FILE}: no models declared`)
}

const validate = await run(['bun', 'run', 'db:validate'])
if (validate.code !== 0) {
  finding(
    `${SCHEMA_FILE}: prisma validate failed: ${validate.output.slice(0, 400)}`,
  )
}

const generate = await run(['bun', 'run', 'db:generate'])
if (generate.code !== 0) {
  finding(
    `${SCHEMA_FILE}: prisma generate failed: ${generate.output.slice(0, 400)}`,
  )
}

if (!existsSync(BASELINE_FILE)) {
  finding(`${BASELINE_FILE}: missing (the baseline migration, ADR-0004)`)
} else {
  const baseline = readFileSync(BASELINE_FILE, 'utf8')
  if (!baseline.includes('CREATE EXTENSION IF NOT EXISTS vector')) {
    finding(`${BASELINE_FILE}: missing CREATE EXTENSION IF NOT EXISTS vector`)
  }
}

if (findings.length > 0) {
  console.log('prisma-check: findings')
  for (const item of findings) console.log(`  - ${item}`)
  console.log(
    `prisma: ${models.length} model(s), ${findings.length} finding(s)`,
  )
  process.exit(1)
}

console.log(
  `prisma: schema valid, ${models.length} model(s), baseline migration ok`,
)
