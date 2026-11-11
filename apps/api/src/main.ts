import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module.js'
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
  // El front de desarrollo corre en otro puerto; credenciales para el token
  // en memoria. Restringir el origen al desplegar.
  app.enableCors({ origin: true, credentials: true })

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
