// DOCU C1 (#58) — idempotent seed for Configuración 1 (semilla mínima).
//
// Applies prisma/seed/c1.sql to the database declared in DATABASE_URL and
// prints what is now in there. Safe to run any number of times: the SQL uses
// fixed UUIDs and ON CONFLICT DO NOTHING. The monthly corpus is NOT part of
// the seed: issue #59 emits it from the dataset (#61).
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { config as loadEnv } from 'dotenv'
import { Client } from 'pg'

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
loadEnv({ path: join(rootDir, '.env') })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL no está definido (.env o entorno)')
  process.exit(1)
}

const seedPath = join(rootDir, 'apps', 'api', 'prisma', 'seed', 'c1.sql')
const sql = readFileSync(seedPath, 'utf8')

const client = new Client({ connectionString: databaseUrl })
await client.connect()
try {
  await client.query(sql)
  const counts = await client.query<{ label: string; total: string }>(`
    SELECT 'facilities' AS label, count(*)::text AS total FROM "core"."facility"
    UNION ALL SELECT 'departments', count(*)::text FROM "core"."department"
    WHERE "facility_id" = 'c1000000-0000-4000-8000-000000000001'
    UNION ALL SELECT 'users', count(*)::text FROM "core"."app_user"
    WHERE "facility_id" = 'c1000000-0000-4000-8000-000000000001'
    UNION ALL SELECT 'permissions', count(*)::text FROM "core"."permission"
    UNION ALL SELECT 'roles', count(*)::text FROM "core"."role"
    UNION ALL SELECT 'families', count(*)::text FROM "config"."family_config"
    WHERE "facility_id" = 'c1000000-0000-4000-8000-000000000001'
    UNION ALL SELECT 'rules', count(*)::text FROM "config"."validation_rule"
    WHERE "facility_id" = 'c1000000-0000-4000-8000-000000000001'
    UNION ALL SELECT 'entity_types', count(*)::text FROM "graph"."entity_type"
    WHERE "facility_id" = 'c1000000-0000-4000-8000-000000000001'
    UNION ALL SELECT 'machines', count(*)::text FROM "graph"."entity"
    WHERE "facility_id" = 'c1000000-0000-4000-8000-000000000001'
      AND "code" LIKE 'T%'
  `)
  for (const row of counts.rows) {
    console.log(`${row.label.padEnd(13)} ${row.total}`)
  }
  console.log('seed C1 aplicado (idempotente)')
} finally {
  await client.end()
}
