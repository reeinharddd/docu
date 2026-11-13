import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger'
import { OperationalResponseException } from '../common/operational-response.exception.js'
import { HealthReportDto } from './health-report.dto.js'
import {
  healthReport,
  probePostgres,
  probeRedis,
  probeWorker,
} from './probes.js'

/**
 * Operational gate (ARQUITECTURA.md §1): reports each segment honestly.
 * All up -> 200 { status: 'ok' }. Any segment down -> 503 with a structured
 * degraded body: a health gate that answers 500 without diagnosis hides
 * which segment failed, and one that answers 200 while a segment is down
 * lies (finding of the orchestration drill, 2026-11-07).
 *
 * The degraded body is an operational report, not a business error: it leaves
 * the API as it is (`{status, postgres, redis, worker}`) instead of the
 * generic error envelope, so whoever reads it knows which segment failed.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({
    description: 'Todos los segmentos responden',
    type: HealthReportDto,
  })
  @ApiResponse({
    status: 503,
    description:
      'Algún segmento está caído: el cuerpo dice cuál (misma forma que el 200)',
    type: HealthReportDto,
  })
  async check(): Promise<HealthReportDto> {
    const report = healthReport(
      await probePostgres(),
      await probeRedis(),
      await probeWorker(),
    )
    if (report.status === 'degraded') {
      throw new OperationalResponseException(report, 503)
    }
    return report
  }
}
