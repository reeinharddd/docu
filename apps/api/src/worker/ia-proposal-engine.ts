// La costura real: los motores de #85 (ADR-0020) por detrás de la interfaz
// del worker. OCR con el motor de visión, familia propuesta con el motor de
// scoring (confianza calibrada) y campos con el LLM atado al esquema de la
// familia (IA.md §2: un modelo no devuelve texto libre).
import { IaRunner } from '../ia/ia-runner.js'
import type { ProposalEngine } from './proposal-engine.js'

export class IaProposalEngine implements ProposalEngine {
  constructor(private readonly runner: IaRunner) {}

  async recognize(input: {
    bytes: Uint8Array
    mimeType: string
  }): Promise<{ text: string }> {
    const output = await this.runner.recognizeDocument(input)
    return { text: output.text }
  }

  async classify(input: {
    text: string
    candidates: readonly string[]
  }): Promise<{ label: string; confidence: number }> {
    return this.runner.score({
      text: input.text,
      candidates: input.candidates,
    })
  }

  async mapFields(input: {
    text: string
    schema: Record<string, unknown>
  }): Promise<Record<string, unknown>> {
    const output = await this.runner.complete({
      system:
        'Extrae los campos del documento. Responde solo con el objeto JSON ' +
        'que pide el esquema, sin texto alrededor.',
      prompt: input.text,
      jsonSchema: {
        name: 'family_fields',
        schema: input.schema,
      },
    })
    const json = output.json
    if (typeof json !== 'object' || json === null || Array.isArray(json)) {
      throw new Error(
        `el modelo no devolvió un objeto de campos: ${output.raw.slice(0, 200)}`,
      )
    }
    return json as Record<string, unknown>
  }
}
