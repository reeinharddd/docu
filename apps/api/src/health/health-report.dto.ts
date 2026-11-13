// Contrato de la respuesta de la puerta de salud.
//
// El DTO es la definición **única** de la forma: las sondas devuelven este
// tipo y el OpenAPI lo publica. Así el contrato publicado no puede divergir
// del que sale en runtime (la puerta es la que dice qué segmento cayó:
// BITACORA.md §"Defectos que encontró el drill de orquestación").
import { ApiProperty } from '@nestjs/swagger'
import type { QueueDepth } from '../queues/heartbeat.js'

export class WorkerHealthDto {
  @ApiProperty({
    description:
      'El worker publica su latido en Redis; si no está, no vive (ningún worker procesa la cola)',
  })
  alive!: boolean

  @ApiProperty({
    description: 'Profundidad por cola en el último latido',
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        waiting: { type: 'integer' },
        active: { type: 'integer' },
        delayed: { type: 'integer' },
        failed: { type: 'integer' },
        completed: { type: 'integer' },
        paused: { type: 'integer' },
      },
    },
  })
  queues!: Record<string, QueueDepth>
}

export class HealthReportDto {
  @ApiProperty({
    enum: ['ok', 'degraded'],
    description:
      'ok solo si PostgreSQL, Redis y el worker responden; degraded en cualquier otro caso',
  })
  status!: 'ok' | 'degraded'

  @ApiProperty({ enum: ['up', 'down'], description: 'Sonda de PostgreSQL' })
  postgres!: 'up' | 'down'

  @ApiProperty({ enum: ['up', 'down'], description: 'Sonda de Redis' })
  redis!: 'up' | 'down'

  @ApiProperty({ type: WorkerHealthDto })
  worker!: WorkerHealthDto
}
