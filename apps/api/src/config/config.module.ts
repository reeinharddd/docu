import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { FamiliesController } from './families/families.controller.js'
import { PrismaFamiliesStore } from './families/families.prisma-store.js'
import { FamiliesService } from './families/families.service.js'
import { FAMILIES_STORE } from './families/families.store.js'

// Catálogos y reglas de la instalación (familias, reglas): configuración que
// vive como datos (ADR-0009). Los endpoints nuevos de config van aquí.
@Module({
  imports: [AuthModule],
  controllers: [FamiliesController],
  providers: [
    PrismaFamiliesStore,
    { provide: FAMILIES_STORE, useExisting: PrismaFamiliesStore },
    FamiliesService,
  ],
  exports: [FamiliesService, FAMILIES_STORE],
})
export class ConfigModule {}
