import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { DiskOriginalsStore } from './disk-originals.store.js'
import { FilesController } from './files.controller.js'
import { FilesService, uploadOptionsFromEnv } from './files.service.js'
import { FILES_STORE } from './files.store.js'
import { ORIGINALS_STORE } from './originals.store.js'
import { PrismaFilesStore } from './prisma-files.store.js'

// AuthModule brings the session and permission guards (it exports AUTH_STORE
// precisely so other modules can mount them). The stores are bound by token:
// the service depends on ports, the adapters are the only things that know
// Prisma and the disk.
@Module({
  imports: [AuthModule],
  controllers: [FilesController],
  providers: [
    PrismaFilesStore,
    { provide: FILES_STORE, useExisting: PrismaFilesStore },
    DiskOriginalsStore,
    { provide: ORIGINALS_STORE, useExisting: DiskOriginalsStore },
    {
      provide: FilesService,
      useFactory: (files: PrismaFilesStore, originals: DiskOriginalsStore) =>
        new FilesService(files, originals, uploadOptionsFromEnv()),
      inject: [PrismaFilesStore, DiskOriginalsStore],
    },
  ],
  exports: [FILES_STORE],
})
export class FilesModule {}
