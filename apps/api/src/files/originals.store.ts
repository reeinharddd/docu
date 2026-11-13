// Originals port — where the untouched bytes of an uploaded file live.
//
// REGLAS.md 5: `originales/` is read-only after ingestion; nothing is
// deleted silently. The service asks the port to persist the exact bytes it
// received and only stores the returned path; the adapter decides the layout.
export const ORIGINALS_STORE = 'ORIGINALS_STORE'

export interface OriginalsStore {
  /**
   * Persists the file bytes and returns the storage path that was written.
   * The path is deterministic per (facility, sha256): the filesystem
   * deduplicates by content the same way the database does.
   */
  save(input: {
    facilityCode: string
    sha256: string
    originalName: string
    bytes: Buffer
  }): Promise<string>
}
