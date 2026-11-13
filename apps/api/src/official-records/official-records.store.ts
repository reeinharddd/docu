// Dato oficial — puerto de `official-records` (BRIEF #12).
//
// El módulo solo lee: el dato oficial vive en la vista `truth.official_record`
// (ARQUITECTURA.md §2). La vista no es una tabla, así que el adaptador la
// consulta por SQL y el servicio nunca ve la base.
export const OFFICIAL_RECORDS_STORE = 'OFFICIAL_RECORDS_STORE'

export interface OfficialRecordRow {
  id: string
  code: string
  entityTypeCode: string
  entityTypeName: string
  data: unknown
  version: number
  confirmedByUsername: string | null
  confirmedByName: string | null
  confirmedAt: Date | null
  sourceFileId: string | null
  updatedAt: Date
}

export interface OfficialRecordsStore {
  listOfficial(input: {
    facilityId: string
    limit: number
    offset: number
  }): Promise<OfficialRecordRow[]>
  countOfficial(facilityId: string): Promise<number>
}
