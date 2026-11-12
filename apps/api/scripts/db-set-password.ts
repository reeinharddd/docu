// DOCU — sets or resets the password of a user (local operation).
//
//   bun run db:set-password andres            → generates a password and prints it
//   bun run db:set-password andres "mi clave"  → sets the given password
//
// The password never touches the database in clear: only its bcrypt hash is
// stored in core.app_user.password_hash. The operation is idempotent in the
// sense that it always leaves the user with exactly the password requested.

import { randomInt } from 'node:crypto'
import { existsSync } from 'node:fs'
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

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL no está definido (.env o entorno)')
  process.exit(1)
}

const [username, password] = process.argv.slice(2)
if (!username) {
  console.error('uso: bun run db:set-password <usuario> [contraseña]')
  process.exit(1)
}

const ALPHABET = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function randomPassword(length = 12): string {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += ALPHABET[randomInt(ALPHABET.length)]
  }
  return out
}

const plain = password ?? randomPassword()
if (plain.length < 8) {
  console.error('la contraseña debe tener al menos 8 caracteres')
  process.exit(1)
}

const client = new Client({ connectionString: databaseUrl })
await client.connect()
try {
  const found = await client.query<{ id: string; full_name: string }>(
    `SELECT "id", "full_name" FROM "core"."app_user" WHERE "username" = $1`,
    [username],
  )
  const user = found.rows[0]
  if (!user) {
    console.error(`no existe ningún usuario con username "${username}"`)
    process.exit(1)
  }
  const passwordHash = await hash(plain, 10)
  await client.query(
    `UPDATE "core"."app_user" SET "password_hash" = $1, "updated_at" = now() WHERE "id" = $2`,
    [passwordHash, user.id],
  )
  console.log(`contraseña de ${username} (${user.full_name}) actualizada`)
  if (!password) {
    console.log(`contraseña: ${plain}`)
    console.log('no se vuelve a mostrar: guárdala ahora')
  }
} finally {
  await client.end()
}
