import { Controller, Get, HttpException } from '@nestjs/common'
import { healthReport, probePostgres, probeRedis } from './probes.js'

/**
 * Operational gate (ARQUITECTURA.md §1): reports each segment honestly.
 * All up -> 200 { status: 'ok' }. Any segment down -> 503 with a structured
 * degraded body: a health gate that answers 500 without diagnosis hides
 * which segment failed, and one that answers 200 while a segment is down
 * lies (finding of the orchestration drill, 2026-11-07).
 */
@Controller('health')
export class HealthController {
  @Get()
  async check() {
    const report = healthReport(await probePostgres(), await probeRedis())
    if (report.status === 'degraded') throw new HttpException(report, 503)
    return report
  }
}
