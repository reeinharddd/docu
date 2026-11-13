// Patrón de prueba de endpoint (BRIEF #45): levanta una app Nest real (sin
// escuchar en un puerto), le aplica los mismos filtros y pipes globales que
// `src/main.ts` y devuelve una `supertest` atada a su servidor HTTP. El
// equipo copia este helper para probar cualquier controller.
import {
  type INestApplication,
  type ModuleMetadata,
  ValidationPipe,
} from '@nestjs/common'
import { Test, type TestingModuleBuilder } from '@nestjs/testing'
import request from 'supertest'
import { ApiErrorFilter } from '../../src/common/http-exception.filter.js'

export type TestApp = {
  app: INestApplication
  http: ReturnType<typeof request>
}

export async function createTestApp(
  metadata: ModuleMetadata,
  overrides?: (builder: TestingModuleBuilder) => TestingModuleBuilder,
): Promise<TestApp> {
  let builder = Test.createTestingModule(metadata)
  if (overrides) {
    builder = overrides(builder)
  }
  const moduleRef = await builder.compile()
  const app = moduleRef.createNestApplication()
  // Los mismos globales que main.ts: sin ellos las pruebas no ven la
  // validación ni el sobre de error de producción.
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
  return { app, http }
}
