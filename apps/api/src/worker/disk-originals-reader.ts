// Adaptador de disco del original: lee el archivo que la API dejó
// intacto. El path viene de `ingest.source_file.storage_path`, que la API
// grabó al guardar.
import { readFile } from 'node:fs/promises'
import { Injectable } from '@nestjs/common'
import { ORIGINALS_READER, type OriginalsReader } from './originals-reader.js'

@Injectable()
export class DiskOriginalsReader implements OriginalsReader {
  async read(storagePath: string): Promise<Buffer> {
    return readFile(storagePath)
  }
}

export { ORIGINALS_READER }
