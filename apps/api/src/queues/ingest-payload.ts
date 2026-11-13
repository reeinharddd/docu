// El contrato del job de ingesta, compartido por la API (que encola) y el
// worker (que procesa). El identificador del trabajo **no** viaja en el
// payload: es el id del job de BullMQ, y la fila de `platform.job_run` lleva
// ese mismo id (una corrida, una fila).
export interface IngestPayload {
  sourceFileId: string
  sha256: string
  familyCode: string
}
