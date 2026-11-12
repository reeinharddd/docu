// Prueba de persistencia de punta a punta (BRIEF #45): la API completa
// (`AppModule`) arranca contra una base scratch aislada y recién migrada, y un
// login real escribe una sesión en `platform.session`. Es el patrón que #12
// copia para cada endpoint con base de datos.
import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import {
  type FacilitySeed,
  getSpecDb,
  seedFacility,
  specDatabaseUrl,
} from '../../prisma/tests/helpers/spec-db.js'
import { AppModule } from '../../src/app.module.js'
import { ApiErrorFilter } from '../../src/common/http-exception.filter.js'

const PASSWORD = 'clave-de-spec'

let seed: FacilitySeed

beforeAll(async () => {
  const client = await getSpecDb()
  seed = await seedFacility(client, 'e2e', [])

  // El seed no asigna contraseña: se la pone solo al operador de esta corrida.
  const passwordHash = await hash(PASSWORD, 4)
  await client.query(
    `UPDATE "core"."app_user" SET "password_hash" = $1 WHERE "id" = $2`,
    [passwordHash, seed.workerId],
  )

  // El PrismaService real lee DATABASE_URL en su constructor: se apunta a la
  // base scratch antes de compilar el módulo.
  process.env.DATABASE_URL = specDatabaseUrl()
})

afterAll(async () => {
  // El cliente de la base scratch es compartido entre los archivos de esta
  // corrida: no se cierra aquí, se cierra con el proceso.
})

describe('POST /v1/auth/login (persistencia)', () => {
  it('autentica y escribe la sesión en platform.session', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    const app = moduleRef.createNestApplication()
    app.useGlobalFilters(new ApiErrorFilter())
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    await app.init()
    const http = request(app.getHttpServer())

    try {
      const client = await getSpecDb()
      const before = await sessionCount(client)

      const res = await http
        .post('/v1/auth/login')
        .send({ username: 'operador', password: PASSWORD })

      expect(res.status).toBe(200)
      expect(res.body.token).toBeString()
      expect(res.body.user.username).toBe('operador')
      expect(res.body.user.facilityCode).toBe('e2e')

      const after = await sessionCount(client)
      expect(after).toBe(before + 1)
    } finally {
      await app.close()
    }
  })

  it('rechaza una contraseña incorrecta con 401', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    const app = moduleRef.createNestApplication()
    app.useGlobalFilters(new ApiErrorFilter())
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    await app.init()
    const http = request(app.getHttpServer())

    try {
      const res = await http
        .post('/v1/auth/login')
        .send({ username: 'operador', password: 'equivocada' })

      expect(res.status).toBe(401)
      expect(res.body.code).toBe('UNAUTHENTICATED')
    } finally {
      await app.close()
    }
  })
})

async function sessionCount(
  client: Awaited<ReturnType<typeof getSpecDb>>,
): Promise<number> {
  const result = await client.query<{ count: string }>(
    `SELECT count(*)::text AS count FROM "platform"."session"`,
  )
  return Number(result.rows[0]?.count ?? 0)
}
