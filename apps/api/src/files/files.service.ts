// Ingestion rules (POST /v1/files, ARQUITECTURA.md §3.1–3.2): the server
// computes the sha256, validates family, type and size, and registers the
// file exactly once per (facility, sha256). A duplicate is a 409 that points
// to the original; nothing is written twice.
import { createHash } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'
import type { SessionUser } from '../auth/auth.service.js'
import { ApiError } from '../common/api-error.js'
import { FILES_STORE, type FilesStore } from './files.store.js'
import { ORIGINALS_STORE, type OriginalsStore } from './originals.store.js'

// Document types of case C1: scanned paperwork (pdf/images) and the Excel
// sheets read by family (#18). Deep magic-byte checking arrives with the
// processing pipeline (#3); today the declared type is validated.
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/tiff',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const

export const DEFAULT_UPLOAD_MAX_BYTES = 50 * 1024 * 1024

export interface UploadOptions {
  maxBytes: number
}

export function uploadOptionsFromEnv(
  env: Record<string, string | undefined> = process.env,
): UploadOptions {
  const parsed = Number(env.UPLOAD_MAX_BYTES)
  return {
    maxBytes:
      Number.isFinite(parsed) && parsed > 0
        ? Math.floor(parsed)
        : DEFAULT_UPLOAD_MAX_BYTES,
  }
}

export interface RegisterFileInput {
  familyCode: string
  originalName: string
  mimeType: string
  byteSize: number
  bytes: Buffer
}

export interface RegisteredFile {
  sourceFileId: string
  sha256: string
}

@Injectable()
export class FilesService {
  constructor(
    @Inject(FILES_STORE) private readonly store: FilesStore,
    @Inject(ORIGINALS_STORE) private readonly originals: OriginalsStore,
    private readonly options: UploadOptions = {
      maxBytes: DEFAULT_UPLOAD_MAX_BYTES,
    },
  ) {}

  async register(
    input: RegisterFileInput,
    user: SessionUser,
    context: {
      ipAddress?: string | undefined
      userAgent?: string | undefined
    } = {},
  ): Promise<RegisteredFile> {
    // The hash is computed on the server over the exact bytes received:
    // the client never declares it (ARQUITECTURA.md §3.2).
    const sha256 = createHash('sha256').update(input.bytes).digest('hex')

    const family = await this.store.findFamilyConfig(
      user.facilityId,
      input.familyCode,
    )
    if (!family?.isActive) {
      throw ApiError.validation(
        `La familia «${input.familyCode}» no existe o no está activa en tu instalación.`,
        { field: 'familyCode' },
      )
    }
    const allowed = (ALLOWED_MIME_TYPES as readonly string[]).includes(
      input.mimeType,
    )
    if (!allowed) {
      throw ApiError.validation(
        'Tipo de archivo no permitido; sube pdf, png, jpg, tiff o Excel.',
        { field: 'file' },
      )
    }
    if (input.byteSize > this.options.maxBytes) {
      throw ApiError.validation(
        `El archivo supera el tamaño máximo de ${Math.floor(this.options.maxBytes / (1024 * 1024))} MB.`,
        { field: 'file' },
      )
    }
    const existing = await this.store.findFileIdBySha256(
      user.facilityId,
      sha256,
    )
    if (existing !== null) {
      throw ApiError.conflict('El archivo ya fue registrado.', {
        sha256,
        sourceFileId: existing,
      })
    }

    const storagePath = await this.saveOriginalOr500({
      facilityCode: user.facilityCode,
      sha256,
      originalName: input.originalName,
      bytes: input.bytes,
    })

    const created = await this.store.createSourceFile({
      facilityId: user.facilityId,
      familyConfigId: family.id,
      originalName: input.originalName,
      sha256,
      mimeType: input.mimeType,
      byteSize: BigInt(input.byteSize),
      storagePath,
      isOcrRequired: family.isOcrRequired,
      receivedById: user.userId,
    })

    // The API enqueues (ADR-0011): the job row is written in the same
    // request; the BullMQ enqueue itself is the worker's side (#46) and the
    // registered-without-job gap is documented in ARQUITECTURA.md §3.2.
    await this.store.createJobRun({
      facilityId: user.facilityId,
      queue: 'ingest',
      jobId: `ingest:${created.id}`,
      status: 'queued',
      input: {
        sourceFileId: created.id,
        familyCode: family.familyCode,
        sha256,
      },
    })
    await this.store.createAuditEntry({
      facilityId: user.facilityId,
      actorId: user.userId,
      action: 'file.received',
      targetTable: 'ingest.source_file',
      targetId: created.id,
      details: {
        sha256,
        familyCode: family.familyCode,
        byteSize: input.byteSize,
        originalName: input.originalName,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    })

    return { sourceFileId: created.id, sha256 }
  }

  /**
   * The original bytes are the source of truth (REGLAS.md 5): a file that
   * could not be written is never registered in the database. An unexpected
   * storage failure leaves the request as a clean 500 (envelope §2.1);
   * nothing was written yet, so the client can retry safely.
   */
  private async saveOriginalOr500(input: {
    facilityCode: string
    sha256: string
    originalName: string
    bytes: Buffer
  }): Promise<string> {
    try {
      return await this.originals.save(input)
    } catch {
      throw ApiError.internal()
    }
  }
}
