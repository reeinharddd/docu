import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { AUTH_STORE } from './auth.store.js'
import { PermissionsGuard } from './permissions.guard.js'
import { PrismaAuthStore } from './prisma-auth.store.js'
import { SessionGuard } from './session.guard.js'

// The store is bound by token: the service depends on the port, the adapter
// is the only thing that knows Prisma.
@Module({
  controllers: [AuthController],
  providers: [
    // The class is registered once and bound to the port token: the service
    // depends on the port, the guard depends on the adapter.
    PrismaAuthStore,
    { provide: AUTH_STORE, useExisting: PrismaAuthStore },
    AuthService,
    SessionGuard,
    PermissionsGuard,
  ],
  exports: [AuthService, SessionGuard, PermissionsGuard, AUTH_STORE],
})
export class AuthModule {}
