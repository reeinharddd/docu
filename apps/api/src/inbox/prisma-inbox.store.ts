// Adaptador Prisma de la bandeja (BRIEF #12).
//
// Aquí vive lo que el servicio no puede saber: la transacción de la
// disposición. Confirmar escribe tres cosas —el estado de `graph.entity`, la
// fila de `truth.origin_history` y la bitácora— y las tres van juntas o no
// van: un oficial sin origen es justo lo que RF-03 prohíbe.
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'
import type {
  DispositionInput,
  DispositionOutcome,
  InboxProposalRow,
  InboxStore,
} from './inbox.store.js'

@Injectable()
export class PrismaInboxStore implements InboxStore {
  constructor(private readonly prisma: PrismaService) {}

  async listPending(input: {
    facilityId: string
    limit: number
    offset: number
  }): Promise<InboxProposalRow[]> {
    const rows = await this.prisma.entity.findMany({
      where: { facilityId: input.facilityId, status: 'pending_confirmation' },
      // Orden estable con desempate por id: la página no repite ni pierde
      // propuestas entre llamadas (ADR-0022).
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: input.limit,
      skip: input.offset,
      select: {
        id: true,
        code: true,
        status: true,
        version: true,
        data: true,
        updatedAt: true,
        sourceFileId: true,
        entityType: { select: { code: true, name: true } },
        sourceFile: { select: { id: true, originalName: true } },
      },
    })
    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      status: row.status,
      version: Number(row.version),
      data: row.data,
      entityTypeCode: row.entityType.code,
      entityTypeName: row.entityType.name,
      sourceFileId: row.sourceFileId,
      sourceOriginalName: row.sourceFile?.originalName ?? null,
      updatedAt: row.updatedAt,
    }))
  }

  async countPending(facilityId: string): Promise<number> {
    return this.prisma.entity.count({
      where: { facilityId, status: 'pending_confirmation' },
    })
  }

  async confirm(input: DispositionInput): Promise<DispositionOutcome> {
    return this.prisma.$transaction(async (tx) => {
      const current = await this.current(tx, input)
      if (!current) {
        return { outcome: 'not-found' }
      }
      if (current.status !== 'pending_confirmation') {
        return current.status === 'draft'
          ? { outcome: 'not-in-review' }
          : { outcome: 'already-disposed' }
      }

      if (current.sourceFileId === null) {
        // `truth.origin_history.source_file_id` es NOT NULL: sin documento no
        // se puede dejar el origen del dato oficial.
        return { outcome: 'no-origin' }
      }

      const confirmedAt = new Date()
      const version = current.version + 1n
      // Guardia de transición en SQL: la escritura solo procede si el estado
      // sigue siendo `pending_confirmation` al momento del UPDATE. Si otra
      // disposición ganó la fila entre la lectura y aquí (doble envío
      // concurrente), el WHERE no coincide y el desenlace es already-disposed;
      // la unique (entity_id, version) de `truth.origin_history` queda como
      // red de seguridad.
      const won = await tx.entity.updateMany({
        where: {
          facilityId: input.facilityId,
          id: current.id,
          status: 'pending_confirmation',
        },
        data: {
          status: 'official',
          confirmedById: input.actorId,
          confirmedAt,
          version,
          updatedById: input.actorId,
        },
      })
      if (won.count === 0) {
        return { outcome: 'already-disposed' }
      }
      // El origen del dato oficial: la fuente, el snapshot y el responsable.
      // `rule_code` y `calculation` quedan nulos porque la API no puede
      // inventar la regla que aplicó el worker: las columnas son nulables en
      // el ER justamente para eso (#3/#46 las llenan).
      await tx.originHistory.create({
        data: {
          facilityId: input.facilityId,
          entityId: current.id,
          version,
          dataSnapshot: current.data as Prisma.InputJsonValue,
          sourceFileId: current.sourceFileId,
          confirmedById: input.actorId,
          createdById: input.actorId,
        },
      })
      await tx.auditLog.create({
        data: {
          facilityId: input.facilityId,
          actorId: input.actorId,
          action: 'entity.confirmed',
          targetTable: 'graph.entity',
          targetId: current.id,
          details: {
            version: Number(version),
            sourceFileId: current.sourceFileId,
          } as Prisma.InputJsonValue,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        },
      })
      return {
        outcome: 'confirmed',
        id: current.id,
        status: 'official',
        version: Number(version),
        confirmedAt,
      }
    })
  }

  async reject(input: DispositionInput): Promise<DispositionOutcome> {
    return this.prisma.$transaction(async (tx) => {
      const current = await this.current(tx, input)
      if (!current) {
        return { outcome: 'not-found' }
      }
      if (current.status !== 'pending_confirmation') {
        return current.status === 'draft'
          ? { outcome: 'not-in-review' }
          : { outcome: 'already-disposed' }
      }

      const version = current.version + 1n
      // Mismo guardia de transición en SQL que en confirm: sin él, dos
      // rechazos concurrentes escribirían dos veces la versión.
      const won = await tx.entity.updateMany({
        where: {
          facilityId: input.facilityId,
          id: current.id,
          status: 'pending_confirmation',
        },
        data: {
          status: 'rejected',
          version,
          updatedById: input.actorId,
        },
      })
      if (won.count === 0) {
        return { outcome: 'already-disposed' }
      }
      // Un dato rechazado no tiene origen oficial: solo bitácora
      // (ARQUITECTURA.md §4.3).
      await tx.auditLog.create({
        data: {
          facilityId: input.facilityId,
          actorId: input.actorId,
          action: 'entity.rejected',
          targetTable: 'graph.entity',
          targetId: current.id,
          details: { version: Number(version) } as Prisma.InputJsonValue,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        },
      })
      return {
        outcome: 'rejected',
        id: current.id,
        status: 'rejected',
        version: Number(version),
      }
    })
  }

  // La fila se lee dentro de la transacción y filtrada por instalación: un
  // `:id` de otra instalación no existe aquí (404, nunca 403).
  private async current(
    tx: Prisma.TransactionClient,
    input: DispositionInput,
  ): Promise<{
    id: string
    status: string
    version: bigint
    data: unknown
    sourceFileId: string | null
  } | null> {
    const row = await tx.entity.findFirst({
      where: { facilityId: input.facilityId, id: input.entityId },
      select: {
        id: true,
        status: true,
        version: true,
        data: true,
        sourceFileId: true,
      },
    })
    return row
  }
}
