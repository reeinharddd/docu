import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module.js'
import { ConfigModule } from './config/config.module.js'
import { FilesModule } from './files/files.module.js'
import { HealthController } from './health/health.controller.js'
import { InboxModule } from './inbox/inbox.module.js'
import { OfficialRecordsModule } from './official-records/official-records.module.js'
import { PrismaModule } from './prisma/prisma.module.js'

// Composition root: Prisma is global (one client), Auth owns identity and
// the session, Config owns the installation catalogs, Files is the write
// door for documents, Inbox is the human review desk, OfficialRecords reads
// the confirmed data, and the health gate stays at the root because it is
// the operational contract.
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConfigModule,
    FilesModule,
    InboxModule,
    OfficialRecordsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
