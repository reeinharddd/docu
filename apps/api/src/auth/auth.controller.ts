// Auth endpoints — session lifecycle (ADR-0021).
//
// POST /v1/auth/login  → opaque token + user (the front stores the token)
// POST /v1/auth/logout → revokes the current session immediately
// GET  /v1/auth/me     → profile, roles, permissions and domains
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service.js'
import { LoginDto } from './dto/login.dto.js'
import {
  SessionGuard,
  type SessionRequest,
  sessionUserOf,
} from './session.guard.js'

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Inicia sesión y devuelve el token opaco' })
  async login(@Body() body: LoginDto, @Req() request: SessionRequest) {
    const result = await this.auth.login(
      {
        username: body.username,
        password: body.password,
        ...(body.facilityCode ? { facilityCode: body.facilityCode } : {}),
      },
      {
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip,
      },
    )
    return {
      token: result.token,
      expiresAt: result.expiresAt.toISOString(),
      user: result.user,
    }
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Revoca la sesión actual' })
  async logout(@Req() request: SessionRequest): Promise<void> {
    await this.auth.logout(sessionUserOf(request).sessionId)
  }

  @Get('me')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Perfil de la sesión activa' })
  async me(@Req() request: SessionRequest) {
    const user = sessionUserOf(request)
    return this.auth.profile(user.userId)
  }
}
