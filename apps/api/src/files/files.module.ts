// Módulo `files` (ARQUITECTURA.md §2): la única puerta de escritura de
// documentos. AuthModule aporta la sesión y los guardas; el puerto de cola
// conecta con Redis (ADR-0011: la API encola, el worker procesa).
import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { BullMqIngestQueue } from './bullmq-ingest-queue.store.js'
import { DiskOriginalsStore } from './disk-originals.store.js'
import { FilesController } from './files.controller.js'
import { FilesService, uploadOptionsFromEnv } from './files.service.js'
import { FILES_STORE } from './files.store.js'
import { INGEST_QUEUE } from './ingest-queue.store.js'
import { ORIGINALS_STORE } from './originals.store.js'
import { PrismaFilesStore } from './prisma-files.store.js'

@Module({
  imports: [AuthModule],
  controllers: [FilesController],
  providers: [
    PrismaFilesStore,
    { provide: FILES_STORE, useExisting: PrismaFilesStore },
    DiskOriginalsStore,
    { provide: ORIGINALS_STORE, useExisting: DiskOriginalsStore },
    BullMqIngestQueue,
    { provide: INGEST_QUEUE, useExisting: BullMqIngestQueue },
    {
      provide: FilesService,
      useFactory: (
        files: PrismaFilesStore,
        originals: DiskOriginalsStore,
        queue: BullMqIngestQueue,
      ) => new FilesService(files, originals, queue, uploadOptionsFromEnv()),
      inject: [PrismaFilesStore, DiskOriginalsStore, BullMqIngestQueue],
    },
  ],
  exports: [FILES_STORE],
})
export class FilesModule {}
