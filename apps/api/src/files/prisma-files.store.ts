// Prisma adapter for the files port. Every Prisma detail of ingestion lives
// here: the service never sees a Prisma object.
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'
import type {
  FailedJobRun,
  FamilyConfigRow,
  FilesStore,
  NewAuditEntry,
  NewJobRun,
  NewSourceFile,
} from './files.store.js'

@Injectable()
export class PrismaFilesStore implements FilesStore {
  constructor(private readonly prisma: PrismaService) {}

  async findFamilyConfig(
    facilityId: string,
    familyCode: string,
  ): Promise<FamilyConfigRow | null> {
    const row = await this.prisma.familyConfig.findFirst({
      where: { facilityId, familyCode },
      select: {
        id: true,
        facilityId: true,
        familyCode: true,
        name: true,
        parserKey: true,
        isOcrRequired: true,
        isActive: true,
      },
    })
    return row
  }

  async findFileIdBySha256(
    facilityId: string,
    sha256: string,
  ): Promise<string | null> {
    const row = await this.prisma.sourceFile.findUnique({
      where: { facilityId_sha256: { facilityId, sha256 } },
      select: { id: true },
    })
    return row?.id ?? null
  }

  async createSourceFile(input: NewSourceFile): Promise<{ id: string }> {
    const row = await this.prisma.sourceFile.create({
      data: {
        facilityId: input.facilityId,
        familyConfigId: input.familyConfigId,
        originalName: input.originalName,
        sha256: input.sha256,
        mimeType: input.mimeType,
        byteSize: input.byteSize,
        storagePath: input.storagePath,
        isOcrRequired: input.isOcrRequired,
        receivedById: input.receivedById,
      },
      select: { id: true },
    })
    return { id: row.id }
  }

  async createJobRun(input: NewJobRun): Promise<void> {
    await this.prisma.jobRun.create({
      data: {
        facilityId: input.facilityId,
        queue: input.queue,
        jobId: input.jobId,
        status: input.status,
        // The port speaks plain JSON values; Prisma's InputJsonValue is the
        // same shape once it crosses into the adapter.
        input: input.input as Prisma.InputJsonValue,
      },
    })
  }

  async markJobFailed(input: FailedJobRun): Promise<void> {
    await this.prisma.jobRun.update({
      where: {
        queue_jobId: { queue: input.queue, jobId: input.jobId },
      },
      data: {
        status: 'failed',
        error: input.error,
        finishedAt: new Date(),
      },
    })
  }

  async createAuditEntry(input: NewAuditEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        facilityId: input.facilityId,
        actorId: input.actorId,
        action: input.action,
        targetTable: input.targetTable,
        targetId: input.targetId,
        details: input.details as Prisma.InputJsonValue,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    })
  }
}
