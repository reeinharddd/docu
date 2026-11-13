// Excepción de respuesta operacional: el cuerpo sale tal cual.
//
// No toda respuesta no-2xx es un error de negocio. La puerta de salud
// (`GET /health`) es un **reporte** con su propio contrato: cuando un
// segmento cae debe decir *cuál* cayó (`{status: degraded, postgres, redis,
// worker}`), porque una puerta que responde 500 sin diagnóstico esconde la
// causa (drill de orquestación, 2026-11-07; BITACORA.md).
//
// El filtro global aplica el sobre de error `{code, message, details}` a los
// errores de negocio (§2.1). Para esta excepción el filtro devuelve el
// cuerpo tal cual: el reporte no se convierte en error genérico.
import { HttpException } from '@nestjs/common'

export class OperationalResponseException extends HttpException {}
