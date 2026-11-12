import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module.js'
import { parseCorsOrigins } from './common/cors.js'
import { ApiErrorFilter } from './common/http-exception.filter.js'
import { buildOpenApiDocument } from './openapi.js'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // El sobre de error §2.1 aplica a toda respuesta no-2xx.
  app.useGlobalFilters(new ApiErrorFilter())
  // DTOs validados en la entrada: lo que no pasa la validación nunca llega
  // al servicio (whitelist: un campo extra no se cuela en silencio).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  // CORS por lista explícita (SEC-01): no se refleja el origen que pida el
  // cliente. `CORS_ORIGINS` lleva la lista (el .env.example trae el origen
  // del front de desarrollo); sin ella no se refleja ningún cross-origin.
  const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGINS)
  if (corsOrigins === false) {
    console.warn(
      'CORS: CORS_ORIGINS vacio; no se refleja ningun origen cross-origin (scripts y curl siguen funcionando).',
    )
  }
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // OpenAPI como artefacto (ARQUITECTURA.md §8): el documento vive en
  // /v1/openapi.json y `bun run api:openapi` lo guarda en docs/api/.
  const openapi = await buildOpenApiDocument(app)
  SwaggerModule.setup('v1/docs', app, openapi, {
    jsonDocumentUrl: 'v1/openapi.json',
  })

  const port = Number(process.env.PORT_API ?? 3000)
  await app.listen(port)
  console.log(`api escuchando en ${port}`)
}
bootstrap()
