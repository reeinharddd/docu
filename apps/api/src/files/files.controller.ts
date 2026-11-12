// POST /v1/files — the only write door for documents (ADR-0011: the API
// enqueues, the worker processes). Multipart with the file and the declared
// family; the server computes the sha256 and answers { sourceFileId, sha256 }
// (ARQUITECTURA.md §3.1–3.2).
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  PermissionsGuard,
  RequirePermission,
} from '../auth/permissions.guard.js'
import {
  SessionGuard,
  type SessionRequest,
  sessionUserOf,
} from '../auth/session.guard.js'
import { ApiError } from '../common/api-error.js'
import { RegisterFileDto } from './dto/register-file.dto.js'
import { FilesService } from './files.service.js'

@ApiTags('files')
@Controller('v1/files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(SessionGuard, PermissionsGuard)
  // Upload and submit are distinct acts (ROLES.md §3): the endpoint does
  // both, so it demands both permissions.
  @RequirePermission('create', 'submit')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        familyCode: { type: 'string' },
      },
      required: ['file', 'familyCode'],
    },
  })
  @ApiOperation({
    summary:
      'Registra un archivo de una familia; idempotente por (facility, sha256)',
  })
  async register(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: RegisterFileDto,
    @Req() request: SessionRequest,
  ): Promise<{ sourceFileId: string; sha256: string }> {
    if (!file) {
      throw ApiError.validation('Falta el archivo en el campo «file».', {
        field: 'file',
      })
    }
    return this.files.register(
      {
        familyCode: body.familyCode,
        originalName: file.originalname,
        mimeType: file.mimetype,
        byteSize: file.size,
        bytes: file.buffer,
      },
      sessionUserOf(request),
      {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    )
  }
}
