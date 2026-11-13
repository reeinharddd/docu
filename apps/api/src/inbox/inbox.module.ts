// Módulo `inbox` (ARQUITECTURA.md §2): bandeja de revisión humana y las dos
// disposiciones posibles. AuthModule aporta la sesión y los guardas.
import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { InboxController } from './inbox.controller.js'
import { InboxService } from './inbox.service.js'
import { INBOX_STORE } from './inbox.store.js'
import { PrismaInboxStore } from './prisma-inbox.store.js'

@Module({
  imports: [AuthModule],
  controllers: [InboxController],
  providers: [
    PrismaInboxStore,
    { provide: INBOX_STORE, useExisting: PrismaInboxStore },
    InboxService,
  ],
})
export class InboxModule {}
