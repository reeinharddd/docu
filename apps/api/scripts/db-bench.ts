// DOCU C1 (#58) — database bench: speed, load and weight on a real database.
//
// Creates a disposable scratch database (docu_bench), applies the baseline
// migration and the C1 seed, loads the contract volume at the requested scale
// (CONTRATO.md §8: 1 = one simulated month) and measures the hot queries with
// EXPLAIN ANALYZE plus the storage weight. The scratch database is dropped at
// the end unless --keep is passed.
//
//   bun scripts/db-bench.ts [scale] [--keep]
import { spawn } from 'node:child_process'
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

const BENCH_DB = 'docu_bench'
const FACILITY = 'c1000000-0000-4000-8000-000000000001'
const SCALE = Number(process.argv[2] ?? '1') || 1
const KEEP = process.argv.includes('--keep')

const apiDir = join(rootDir, 'apps', 'api')
const prismaBin = join(apiDir, 'node_modules', '.bin', 'prisma')
const seedDir = join(apiDir, 'prisma', 'seed')
const seedFiles = [join(seedDir, 'engine.sql'), join(seedDir, 'c1.sql')]

function databaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL no está definido (.env o entorno)')
    process.exit(1)
  }
  return url
}

function configFor(database: string) {
  const parsed = new URL(databaseUrl())
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
  }
}

function targetUrl(database: string): string {
  const parsed = new URL(databaseUrl())
  parsed.pathname = `/${database}`
  return parsed.toString()
}

function migrate(target: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(prismaBin, ['migrate', 'deploy'], {
      cwd: apiDir,
      env: { ...process.env, DATABASE_URL: target },
      stdio: 'ignore',
    })
    proc.on('error', reject)
    proc.on('exit', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`migrate deploy exited ${code}`)),
    )
  })
}

async function timed(
  client: Client,
  label: string,
  sql: string,
  params: unknown[] = [],
) {
  const started = performance.now()
  const result = await client.query(sql, params)
  const ms = performance.now() - started
  console.log(`${label.padEnd(46)} ${ms.toFixed(1).padStart(9)} ms`)
  return result
}

type PlanNode = {
  'Node Type': string
  'Index Name'?: string
  Plans?: PlanNode[]
}

function collectIndexes(node: PlanNode, acc: Set<string>): void {
  if (node['Index Name']) {
    acc.add(node['Index Name'])
  }
  for (const child of node.Plans ?? []) {
    collectIndexes(child, acc)
  }
}

async function analyze(
  client: Client,
  label: string,
  sql: string,
  params: unknown[] = [],
) {
  const result = await client.query<{
    'QUERY PLAN': Array<{ 'Execution Time': number; Plan: PlanNode }>
  }>(`EXPLAIN (ANALYZE, FORMAT JSON, TIMING OFF) ${sql}`, params)
  const entry = result.rows[0]?.['QUERY PLAN']?.[0]
  const ms = entry?.['Execution Time'] ?? -1
  const indexes = new Set<string>()
  if (entry?.Plan) collectIndexes(entry.Plan, indexes)
  console.log(
    `${label.padEnd(46)} ${ms.toFixed(1).padStart(9)} ms  ${[...indexes].join(', ')}`,
  )
}

async function main() {
  console.log(`escala: x${SCALE} (CONTRATO.md §8 · un mes = x1)`)

  const admin = new Client(configFor('postgres'))
  await admin.connect()
  try {
    await admin.query(`DROP DATABASE IF EXISTS ${BENCH_DB} WITH (FORCE)`)
    await admin.query(`CREATE DATABASE ${BENCH_DB}`)
  } finally {
    await admin.end()
  }

  const target = targetUrl(BENCH_DB)
  const migrateStarted = performance.now()
  await migrate(target)
  console.log(
    `migración baseline en base limpia: ${(performance.now() - migrateStarted).toFixed(0).padStart(6)} ms`,
  )

  const seedStarted = performance.now()
  const seeder = new Client(configFor(BENCH_DB))
  await seeder.connect()
  for (const file of seedFiles) {
    await seeder.query(readFileSync(file, 'utf8'))
  }
  console.log(
    `semilla C1: ${(performance.now() - seedStarted).toFixed(0).padStart(11)} ms`,
  )
  await seeder.end()

  const client = new Client(configFor(BENCH_DB))
  await client.connect()

  const files = 170 * SCALE
  const shifts = 60 * SCALE
  const pairs = 14 * SCALE

  console.log('\n-- carga (inserción masiva) --')
  await timed(
    client,
    `${files} archivos de fuente`,
    `
    INSERT INTO "ingest"."source_file"
      ("id", "facility_id", "family_config_id", "original_name", "sha256",
       "mime_type", "byte_size", "storage_path", "received_at", "received_by_id")
    SELECT gen_random_uuid(), f."facility_id", f."id",
           f."family_code" || '-' || g || '.pdf',
           md5(f."family_code" || '-' || g || '-' || now()::text),
           'application/pdf', 4096,
           'originales/' || f."family_code" || '-' || g || '.pdf',
           TIMESTAMPTZ '2026-10-05 06:00:00-06' + ((g - 1) * interval '3 hours'),
           (SELECT "id" FROM "core"."app_user" WHERE "username" = 'andres'
            AND "facility_id" = f."facility_id")
    FROM "config"."family_config" f
    CROSS JOIN generate_series(1, $1) AS g
    WHERE f."facility_id" = $2`,
    [files, FACILITY],
  )

  await timed(
    client,
    `${shifts} turnos como entidades`,
    `
    INSERT INTO "graph"."entity"
      ("id", "facility_id", "entity_type_id", "code", "data", "created_by_id", "updated_at")
    SELECT gen_random_uuid(), $1, t."id", 'shift-' || g,
           jsonb_build_object('machine', CASE WHEN g % 2 = 0 THEN 'TP-02' ELSE 'TP-01' END),
           (SELECT "id" FROM "core"."app_user" WHERE "username" = 'jorge' AND "facility_id" = $1),
           now()
    FROM "graph"."entity_type" t, generate_series(1, $2) AS g
    WHERE t."facility_id" = $1 AND t."code" = 'shift'`,
    [FACILITY, shifts],
  )

  await timed(
    client,
    `${pairs} pares rollo→orden como relaciones`,
    `
    WITH r AS (
      INSERT INTO "graph"."entity" ("id", "facility_id", "entity_type_id", "code", "data", "created_by_id", "updated_at")
      SELECT gen_random_uuid(), $1, t."id", 'roll-' || g, '{}',
             (SELECT "id" FROM "core"."app_user" WHERE "username" = 'jorge' AND "facility_id" = $1), now()
      FROM "graph"."entity_type" t, generate_series(1, $2) AS g
      WHERE t."facility_id" = $1 AND t."code" = 'roll' RETURNING "id"
    ), o AS (
      INSERT INTO "graph"."entity" ("id", "facility_id", "entity_type_id", "code", "data", "created_by_id", "updated_at")
      SELECT gen_random_uuid(), $1, t."id", 'order-' || g, '{}',
             (SELECT "id" FROM "core"."app_user" WHERE "username" = 'jorge' AND "facility_id" = $1), now()
      FROM "graph"."entity_type" t, generate_series(1, $2) AS g
      WHERE t."facility_id" = $1 AND t."code" = 'production_order' RETURNING "id"
    )
    INSERT INTO "graph"."relation" ("id", "facility_id", "source_entity_id", "target_entity_id", "relation_type", "created_by_id")
    SELECT gen_random_uuid(), $1, r."id", o."id", 'material_for',
           (SELECT "id" FROM "core"."app_user" WHERE "username" = 'jorge' AND "facility_id" = $1)
    FROM (SELECT "id", row_number() OVER (ORDER BY "id") AS n FROM r) r
    JOIN (SELECT "id", row_number() OVER (ORDER BY "id") AS n FROM o) o ON o."n" = r."n"`,
    [FACILITY, pairs],
  )

  await timed(
    client,
    `${shifts} embeddings de 768 (pedidos MRL)`,
    `
    INSERT INTO "platform"."memory_embedding"
      ("id", "facility_id", "entity_id", "chunk", "embedding", "model")
    SELECT gen_random_uuid(), e."facility_id", e."id", 'turno',
           ('[' || array_to_string(array(SELECT round(random()::numeric, 4)::text FROM generate_series(1, 768)), ',') || ']')::vector,
           'bench'
    FROM "graph"."entity" e
    WHERE e."facility_id" = $1 AND e."code" LIKE 'shift-%'`,
    [FACILITY],
  )

  await timed(
    client,
    `${shifts} versiones en origin_history (lineage)`,
    `
    INSERT INTO "truth"."origin_history"
      ("id", "facility_id", "entity_id", "version", "data_snapshot", "source_file_id", "created_by_id")
    SELECT gen_random_uuid(), e."facility_id", e."id", 1, e."data", sf."id",
           (SELECT "id" FROM "core"."app_user" WHERE "username" = 'carmen' AND "facility_id" = $1)
    FROM "graph"."entity" e
    JOIN "graph"."entity_type" t ON t."id" = e."entity_type_id" AND t."facility_id" = e."facility_id"
    JOIN LATERAL (
      SELECT "id" FROM "ingest"."source_file" sf
      WHERE sf."facility_id" = e."facility_id"
        AND sf."original_name" LIKE 'excel_turno-%'
      ORDER BY "received_at" LIMIT 1
    ) sf ON true
    WHERE e."facility_id" = $1 AND e."code" LIKE 'shift-%'`,
    [FACILITY],
  )

  const confirmed = Math.min(20, shifts)
  await timed(
    client,
    `${confirmed} turnos confirmados como oficiales (R-Q1)`,
    `
    UPDATE "graph"."entity" e
    SET "status" = 'official',
        "confirmed_by_id" = (SELECT "id" FROM "core"."app_user" WHERE "username" = 'marta' AND "facility_id" = $1),
        "confirmed_at" = now()
    WHERE e."facility_id" = $1 AND e."code" IN (
      SELECT 'shift-' || g FROM generate_series(1, $2) AS g)`,
    [FACILITY, confirmed],
  )

  console.log('\n-- consultas calientes (EXPLAIN ANALYZE, TIMING OFF) --')
  await analyze(
    client,
    'bandeja: página 3 de 20 (facility + received_at)',
    `
    SELECT "id", "original_name" FROM "ingest"."source_file"
    WHERE "facility_id" = $1 ORDER BY "received_at" DESC LIMIT 20 OFFSET 40`,
    [FACILITY],
  )
  await analyze(
    client,
    'bandeja: total para X-Total-Count',
    `
    SELECT count(*) FROM "ingest"."source_file" WHERE "facility_id" = $1`,
    [FACILITY],
  )
  await analyze(
    client,
    'oficial: página de official_record',
    `
    SELECT "id", "code" FROM "truth"."official_record"
    WHERE "facility_id" = $1 ORDER BY "updated_at" DESC LIMIT 20`,
    [FACILITY],
  )
  await analyze(
    client,
    'lineage: historial de un turno',
    `
    SELECT h."version" FROM "truth"."entity_lineage" h
    WHERE h."facility_id" = $1 AND h."entity_code" = 'shift-1'
    ORDER BY h."version"`,
    [FACILITY],
  )
  await analyze(
    client,
    'lineage: ¿de qué rollo salió esta orden?',
    `
    SELECT r."code" AS roll_code
    FROM "graph"."relation" rel
    JOIN "graph"."entity" o ON o."id" = rel."target_entity_id" AND o."facility_id" = rel."facility_id"
    JOIN "graph"."entity" r ON r."id" = rel."source_entity_id" AND r."facility_id" = rel."facility_id"
    WHERE rel."facility_id" = $1 AND o."code" = 'order-1'
      AND rel."relation_type" = 'material_for'`,
    [FACILITY],
  )
  await analyze(
    client,
    'búsqueda semántica: KNN 5',
    `
    SELECT "id" FROM "platform"."memory_embedding"
    ORDER BY "embedding" <=> (SELECT "embedding" FROM "platform"."memory_embedding" LIMIT 1)
    LIMIT 5`,
  )

  console.log('\n-- peso --')
  const sizes = await client.query<{ relation: string; bytes: string }>(`
    SELECT c."relname" || ' (' || c."relkind"::text || ')' AS relation, pg_total_relation_size(c."oid")::text AS bytes
    FROM pg_class c
    JOIN pg_namespace n ON n."oid" = c."relnamespace"
    WHERE n."nspname" IN ('core', 'ingest', 'graph', 'truth', 'config', 'platform')
      AND c."relkind" IN ('r', 'i')
    ORDER BY pg_total_relation_size(c."oid") DESC LIMIT 10`)
  for (const row of sizes.rows) {
    console.log(
      `${row.relation.padEnd(46)} ${(Number(row.bytes) / 1024).toFixed(0).padStart(9)} KB`,
    )
  }
  const dbSize = await client.query<{ size: string }>(
    'SELECT pg_size_pretty(pg_database_size(current_database()))::text AS size',
  )
  const total = dbSize.rows.at(0)
  if (!total) {
    throw new Error('pg_database_size no devolvio fila')
  }
  console.log(
    `base completa (sin WAL ni logs)             ${total.size.padStart(10)}`,
  )

  await client.end()

  if (!KEEP) {
    const cleaner = new Client(configFor('postgres'))
    await cleaner.connect()
    await cleaner.query(`DROP DATABASE ${BENCH_DB} WITH (FORCE)`)
    await cleaner.end()
    console.log('\nbase de bench eliminada (docu_bench)')
  } else {
    console.log('\nbase de bench conservada (docu_bench)')
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
