// Families port — the narrow surface the reference slice needs.
//
// Ports keep services testable without a database and keep every Prisma
// detail inside the adapter (families.prisma-store.ts).
export const FAMILIES_STORE = 'FAMILIES_STORE'

export interface FamilyRow {
  id: string
  facilityId: string
  familyCode: string
  name: string
  parserKey: string
  isOcrRequired: boolean
}

export interface FamiliesStore {
  list(input: {
    facilityId: string
    limit: number
    offset: number
  }): Promise<FamilyRow[]>
  count(facilityId: string): Promise<number>
  findByCode(facilityId: string, familyCode: string): Promise<FamilyRow | null>
}
