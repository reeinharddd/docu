// Writes the OpenAPI artifact (ARQUITECTURA.md §8) or checks it is current.
//
//   bun run openapi          → regenerates docs/api/openapi.json
//   bun run openapi:check    → fails if the artifact on disk is stale
import 'reflect-metadata'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { NestFactory } from '@nestjs/core'
import { config as loadEnv } from 'dotenv'

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

// The artifact does not need a live database: the app is created (providers
// are instantiated) but never listens, so nothing connects. The placeholder
// only satisfies the constructor of PrismaService.
process.env.DATABASE_URL ??=
  'postgresql://docu:docu@localhost:5432/docu?schema=public'

const target = join(rootDir, 'docs', 'api', 'openapi.json')
const check = process.argv.includes('--check')

const { AppModule } = await import('../src/app.module.js')
const { buildOpenApiDocument } = await import('../src/openapi.js')

const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] })
const document = await buildOpenApiDocument(app)
await app.close()

const serialized = `${JSON.stringify(document, null, 2)}\n`

if (check) {
  // Semantic comparison: the formatter (biome, pre-commit hook) may rewrite
  // the file's layout without changing the contract.
  const current = existsSync(target) ? JSON.parse(readFileSync(target, 'utf8')) : null
  const same = JSON.stringify(current) === JSON.stringify(document)
  if (!same) {
    console.error(
      'el artefacto OpenAPI está desactualizado. Regenera con: bun run api:openapi',
    )
    process.exit(1)
  }
  console.log('openapi.json está al día')
} else {
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, serialized)
  console.log(`openapi escrito en ${target}`)
}
