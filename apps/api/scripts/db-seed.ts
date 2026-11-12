// DOCU C1 (#58) — idempotent seed, two fixed layers.
//
// Applies prisma/seed/engine.sql (the engine catalog: any installation) and
// prisma/seed/c1.sql (the C1 installation) to the database declared in
// DATABASE_URL, then prints what is now in there. Safe to run any number of
// times: fixed UUIDs and ON CONFLICT DO NOTHING. The monthly corpus is NOT
// part of the seed: issue #59 emits it from the dataset (#61).

import { randomInt } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { hash } from 'bcryptjs'
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

function databaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL no está definido (.env o entorno)')
    process.exit(1)
  }
  return url
}

const seedDir = join(rootDir, 'apps', 'api', 'prisma', 'seed')
// Dos capas fijas: engine.sql (catálogo del motor, cualquier instalación)
// y c1.sql (la instalación del caso). El corpus dinámico es #59.
const seedFiles = [join(seedDir, 'engine.sql'), join(seedDir, 'c1.sql')]

// La cuenta de arranque de la instalación C1: el usuario con rol admin.
const BOOTSTRAP_USER = 'andres'

// Contraseña legible y aleatoria: se imprime una sola vez y no vive en el
// repo ni en la base en claro (solo su hash bcrypt).
function randomPassword(length = 12): string {
  const alphabet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < length; i++) {
    out += alphabet[randomInt(alphabet.length)]
  }
  return out
}

const client = new Client({ connectionString: databaseUrl() })
await client.connect()
try {
  for (const file of seedFiles) {
    await client.query(readFileSync(file, 'utf8'))
  }

  // Contraseña inicial: solo si el usuario todavía no tiene ninguna. Nunca
  // se reimprime después (el hash no se puede deshacer).
  const admin = await client.query<{
    id: string
    password_hash: string | null
  }>(
    `SELECT "id", "password_hash" FROM "core"."app_user"
     WHERE "username" = $1 AND "facility_id" = 'c1000000-0000-4000-8000-000000000001'`,
    [BOOTSTRAP_USER],
  )
  const adminRow = admin.rows[0]
  if (adminRow && adminRow.password_hash === null) {
    const password = randomPassword()
    const passwordHash = await hash(password, 10)
    await client.query(
      `UPDATE "core"."app_user" SET "password_hash" = $1 WHERE "id" = $2`,
      [passwordHash, adminRow.id],
    )
    console.log(`\ncontraseña inicial de ${BOOTSTRAP_USER}: ${password}`)
    console.log('cámbiala al primer ingreso; no se vuelve a mostrar.\n')
  } else if (adminRow) {
    console.log(
      `\n${BOOTSTRAP_USER} ya tiene contraseña: no se toca (usa "cambiar contraseña").\n`,
    )
  }
  const counts = await client.query<{ label: string; total: string }>(`
    SELECT 'facilities' AS label, count(*)::text AS total FROM "core"."facility"
    UNION ALL SELECT 'departments', count(*)::text FROM "core"."department"
    WHERE "facility_id" = 'c1000000-0000-4000-8000-000000000001'
    UNION ALL SELECT 'users', count(*)::text FROM "core"."app_user"
    WHERE "facility_id" = 'c1000000-0000-4000-8000-000000000001'
    UNION ALL SELECT 'permissions', count(*)::text FROM "core"."permission"
    UNION ALL SELECT 'roles', count(*)::text FROM "core"."role"
    UNION ALL SELECT 'user_roles', count(*)::text FROM "core"."user_role" ur
    JOIN "core"."app_user" u ON u."id" = ur."app_user_id"
    WHERE u."facility_id" = 'c1000000-0000-4000-8000-000000000001'
    UNION ALL SELECT 'domains', count(*)::text FROM "core"."domain"
    WHERE "facility_id" = 'c1000000-0000-4000-8000-000000000001'
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
