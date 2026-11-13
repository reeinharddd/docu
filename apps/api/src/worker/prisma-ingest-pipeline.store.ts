// Adaptador Prisma del pipeline de ingesta (BRIEF #3).
//
// El worker es un proceso aparte: no es un módulo de Nest, así que las clases
// se construyen a mano (ver `worker.ts`). Toda la SQL del pipeline vive aquí.
import { Prisma } from '@prisma/client'
import type { PrismaService } from '../prisma/prisma.service.js'
import type {
  FamilyOption,
  IngestPipelineStore,
  JobOutcome,
  NewEntityProposal,
  NewOcrResult,
  NewParsedRecord,
  NewQuarantine,
  SourceFileForProcessing,
} from './ingest-pipeline.store.js'

export class PrismaIngestPipelineStore implements IngestPipelineStore {
  constructor(private readonly prisma: PrismaService) {}

  async findSourceFile(
    sourceFileId: string,
  ): Promise<SourceFileForProcessing | null> {
    const row = await this.prisma.sourceFile.findUnique({
      where: { id: sourceFileId },
      select: {
        id: true,
        facilityId: true,
        familyConfigId: true,
        originalName: true,
        sha256: true,
        mimeType: true,
        storagePath: true,
        receivedById: true,
        familyConfig: {
          select: { familyCode: true, schemaDefinition: true },
        },
      },
    })
    if (!row) {
      return null
    }
    return {
      id: row.id,
      facilityId: row.facilityId,
      familyConfigId: row.familyConfigId,
      familyCode: row.familyConfig.familyCode,
      originalName: row.originalName,
      sha256: row.sha256,
      mimeType: row.mimeType,
      storagePath: row.storagePath,
      receivedById: row.receivedById,
      familySchema: row.familyConfig.schemaDefinition,
    }
  }

  async listActiveFamilies(facilityId: string): Promise<FamilyOption[]> {
    const rows = await this.prisma.familyConfig.findMany({
      where: { facilityId, isActive: true },
      select: { familyCode: true, name: true },
      orderBy: { familyCode: 'asc' },
    })
    return rows.map((row) => ({ code: row.familyCode, name: row.name }))
  }

  async findEntityType(
    facilityId: string,
    code: string,
  ): Promise<{ id: string } | null> {
    const row = await this.prisma.entityType.findFirst({
      where: { facilityId, code },
      select: { id: true },
    })
    return row
  }

  async createParsedRecord(input: NewParsedRecord): Promise<{ id: string }> {
    const row = await this.prisma.parsedRecord.create({
      data: {
        facilityId: input.facilityId,
        sourceFileId: input.sourceFileId,
        recordIndex: input.recordIndex,
        familyConfigId: input.familyConfigId,
        payload: input.payload as Prisma.InputJsonValue,
        status: input.status,
        createdById: input.createdById,
      },
      select: { id: true },
    })
    return row
  }

  async createOcrResult(input: NewOcrResult): Promise<{ id: string }> {
    const row = await this.prisma.ocrResult.create({
      data: {
        facilityId: input.facilityId,
        sourceFileId: input.sourceFileId,
        parsedRecordId: input.parsedRecordId,
        engine: input.engine,
        engineVersion: input.engineVersion,
        language: input.language,
        textContent: input.textContent,
      },
      select: { id: true },
    })
    return row
  }

  async createEntityProposal(
    input: NewEntityProposal,
  ): Promise<{ id: string }> {
    const row = await this.prisma.entity.create({
      data: {
        facilityId: input.facilityId,
        entityTypeId: input.entityTypeId,
        code: input.code,
        data: input.data as Prisma.InputJsonValue,
        status: 'pending_confirmation',
        sourceFileId: input.sourceFileId,
        createdById: input.createdById,
      },
      select: { id: true },
    })
    return row
  }

  async createQuarantine(input: NewQuarantine): Promise<{ id: string }> {
    const row = await this.prisma.quarantine.create({
      data: {
        facilityId: input.facilityId,
        sourceFileId: input.sourceFileId,
        parsedRecordId: input.parsedRecordId,
        ruleCode: input.ruleCode,
        severity: input.severity,
        reason: input.reason,
      },
      select: { id: true },
    })
    return row
  }

  async markJobRunning(jobId: string): Promise<void> {
    await this.prisma.jobRun.update({
      where: { queue_jobId: { queue: 'ingest', jobId } },
      data: {
        status: 'running',
        attempt: { increment: 1 },
        startedAt: new Date(),
        error: null,
      },
    })
  }

  async finishJob(jobId: string, outcome: JobOutcome): Promise<void> {
    await this.prisma.jobRun.update({
      where: { queue_jobId: { queue: 'ingest', jobId } },
      data: {
        status: outcome.status,
        output: (outcome.output ?? null) as Prisma.InputJsonValue,
        error: outcome.error,
        finishedAt: new Date(),
      },
    })
  }
}
