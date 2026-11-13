// Lectura del original — puerto del worker (BRIEF #3).
//
// La API escribe el original intacto (`ORIGINALS_DIR`); el worker es quien lo
// lee para extraer. `originales/` es de solo lectura (REGLAS.md 5): aquí solo
// hay lectura.
export const ORIGINALS_READER = 'ORIGINALS_READER'

export interface OriginalsReader {
  read(storagePath: string): Promise<Buffer>
}
