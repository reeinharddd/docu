// Files port — the narrow surface the ingestion slice needs from the
// database (POST /v1/files, ARQUITECTURA.md §3.1).
//
// Ports keep the rules testable without a database; every Prisma detail
// lives in files.prisma-store.ts. Family config is read here (ingest needs
// it at write time) instead of importing the config module: modules do not
// import each other's services, they read their own data.
export const FILES_STORE = 'FILES_STORE'

export interface FamilyConfigRow {
  id: string
  facilityId: string
  familyCode: string
  name: string
  parserKey: string
  isOcrRequired: boolean
  isActive: boolean
}

export interface NewSourceFile {
  facilityId: string
  familyConfigId: string
  originalName: string
  sha256: string
  mimeType: string
  byteSize: bigint
  storagePath: string
  isOcrRequired: boolean
  receivedById: string
}

export interface NewJobRun {
  facilityId: string
  queue: string
  jobId: string
  status: string
  input: Record<string, unknown>
}

export interface NewAuditEntry {
  facilityId: string
  actorId: string
  action: string
  targetTable: string
  targetId: string
  details: Record<string, unknown>
  ipAddress?: string | undefined
  userAgent?: string | undefined
}

export interface FilesStore {
  findFamilyConfig(
    facilityId: string,
    familyCode: string,
  ): Promise<FamilyConfigRow | null>
  findFileIdBySha256(facilityId: string, sha256: string): Promise<string | null>
  createSourceFile(input: NewSourceFile): Promise<{ id: string }>
  createJobRun(input: NewJobRun): Promise<void>
  createAuditEntry(input: NewAuditEntry): Promise<void>
}
