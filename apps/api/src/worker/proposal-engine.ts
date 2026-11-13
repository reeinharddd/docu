// Propuesta — la costura con los motores de IA (BRIEF #3).
//
// El modelo propone; el humano dispone (ADR-0006). El worker llama a esta
// costura y nunca ve un motor concreto: la implementación real está en
// `ia-proposal-engine.ts` y las pruebas usan un doble.
export interface ProposalEngine {
  /** Extrae el texto del documento. */
  recognize(input: {
    bytes: Uint8Array
    mimeType: string
  }): Promise<{ text: string }>
  /** Propone la familia, con la confianza calibrada que ordena la revisión. */
  classify(input: {
    text: string
    candidates: readonly string[]
  }): Promise<{ label: string; confidence: number }>
  /** Propone los campos de la familia a partir del texto extraído. */
  mapFields(input: {
    text: string
    schema: Record<string, unknown>
  }): Promise<Record<string, unknown>>
}
