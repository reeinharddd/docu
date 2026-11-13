// Disk adapter for the originals port: writes the untouched bytes to
// `${ORIGINALS_DIR}/${facilityCode}/${sha256}${ext}`. Content-addressed by
// construction: the same file in the same facility lands on the same path,
// so a retry never overwrites different content.
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Injectable } from '@nestjs/common'
import { ORIGINALS_STORE, type OriginalsStore } from './originals.store.js'

export function extensionOf(originalName: string): string {
  const dot = originalName.lastIndexOf('.')
  if (dot < 0 || dot === originalName.length - 1) {
    return ''
  }
  const raw = originalName.slice(dot + 1)
  const clean = raw.replace(/[^A-Za-z0-9]/g, '').slice(0, 8)
  return clean === '' ? '' : `.${clean}`
}

@Injectable()
export class DiskOriginalsStore implements OriginalsStore {
  // Read at save time, not at boot: tests and scripts can point
  // ORIGINALS_DIR without rebuilding the provider.
  private get dir(): string {
    return process.env.ORIGINALS_DIR ?? './originales'
  }

  async save(input: {
    facilityCode: string
    sha256: string
    originalName: string
    bytes: Buffer
  }): Promise<string> {
    const path = join(
      this.dir,
      input.facilityCode,
      `${input.sha256}${extensionOf(input.originalName)}`,
    )
    await mkdir(join(this.dir, input.facilityCode), { recursive: true })
    await writeFile(path, input.bytes)
    return path
  }
}

export { ORIGINALS_STORE }
