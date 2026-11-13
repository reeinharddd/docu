// Módulo `official-records` (ARQUITECTURA.md §2): lee el dato oficial. No
// escribe: el dato oficial es el que alguien confirmó en `inbox`.
import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { OfficialRecordsController } from './official-records.controller.js'
import { OfficialRecordsService } from './official-records.service.js'
import { OFFICIAL_RECORDS_STORE } from './official-records.store.js'
import { PrismaOfficialRecordsStore } from './prisma-official-records.store.js'

@Module({
  imports: [AuthModule],
  controllers: [OfficialRecordsController],
  providers: [
    PrismaOfficialRecordsStore,
    {
      provide: OFFICIAL_RECORDS_STORE,
      useExisting: PrismaOfficialRecordsStore,
    },
    OfficialRecordsService,
  ],
})
export class OfficialRecordsModule {}
