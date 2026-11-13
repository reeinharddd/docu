// Global exception filter: every non-2xx leaves as the §2.1 envelope.
//
// ApiError keeps its code and message. Any other Nest HttpException maps to
// the closest contract code with a safe generic message. Anything unknown is
// logged whole on the server and leaves as INTERNAL, without internals.
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
} from '@nestjs/common'
import type { Response } from 'express'
import { ApiError, type ApiErrorCode } from './api-error.js'
import { OperationalResponseException } from './operational-response.exception.js'

const CODE_BY_STATUS: Record<number, ApiErrorCode> = {
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
  429: 'RATE_LIMITED',
}

const SAFE_MESSAGE_BY_CODE: Record<ApiErrorCode, string> = {
  UNAUTHENTICATED: 'No hay sesión activa.',
  FORBIDDEN: 'No tienes permiso para esta acción.',
  NOT_FOUND: 'Recurso no encontrado.',
  CONFLICT: 'La petición choca con el estado actual.',
  VALIDATION_ERROR: 'La petición no pasa la validación.',
  RATE_LIMITED: 'Demasiadas peticiones.',
  INTERNAL: 'Error interno del servidor.',
}

@Catch()
export class ApiErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>()

    if (exception instanceof ApiError) {
      response.status(exception.getStatus()).json({
        code: exception.code,
        message: exception.message,
        details: exception.details,
      })
      return
    }

    if (exception instanceof OperationalResponseException) {
      // Un reporte operacional no es un error de negocio: su cuerpo es el
      // diagnóstico (que segmento cayó), no el sobre `{code, message,
      // details}`. Perderlo deja la puerta de salud mintiendo por omisión.
      response.status(exception.getStatus()).json(exception.getResponse())
      return
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const code = CODE_BY_STATUS[status] ?? 'INTERNAL'
      response.status(status).json({
        code,
        message: SAFE_MESSAGE_BY_CODE[code],
        details: {},
      })
      return
    }

    // Log completo en el servidor; sobre limpio hacia el cliente.
    console.error('[api] error no controlado:', exception)
    response.status(500).json({
      code: 'INTERNAL',
      message: SAFE_MESSAGE_BY_CODE.INTERNAL,
      details: {},
    })
  }
}
