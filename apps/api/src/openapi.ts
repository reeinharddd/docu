// OpenAPI document — one definition, two consumers: the runtime docs and
// the committed artifact (ARQUITECTURA.md §8).

import type { INestApplication } from '@nestjs/common'
import {
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger'

export function openApiConfig() {
  return new DocumentBuilder()
    .setTitle('DOCU API')
    .setDescription('API de documentación digital — Configuración 1')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build()
}

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  return SwaggerModule.createDocument(app, openApiConfig())
}
