// El pipeline de ingesta (BRIEF #3) — el corazón de RF-01/RF-02.
//
// El archivo entra, el worker extrae el texto, propone la familia con su
// confianza y deja el veredicto (ARQUITECTURA.md §4):
//
//   - propuesta no usable o que contradice la familia declarada →
//     `ingest.quarantine` con motivo visible y el original intacto (RF-02);
//   - propuesta usable → `graph.entity` en `pending_confirmation`: la
//     propuesta llega a la bandeja y solo una persona la publica (RF-03,
//     ADR-0006). El modelo propone; el humano dispone.
//
// El worker decide y escribe; el modelo solo propone.

import type { IngestJob } from '../files/ingest-queue.store.js'
import { classifyScore } from '../ia/scoring.js'
import type {
  IngestPipelineStore,
  SourceFileForProcessing,
} from './ingest-pipeline.store.js'
import type { OriginalsReader } from './originals-reader.js'
import type { ProposalEngine } from './proposal-engine.js'

/**
 * Códigos de regla del propio motor, para lo que no es una regla del caso:
 * una cuarentena siempre cita el código que la causó (ADR-0009) y la única
 * tabla de reglas del caso es `config.validation_rule` (R-P1…R-T1).
 */
export const SYSTEM_RULE = {
  LOW_CONFIDENCE: 'SYS.LOW_CONFIDENCE',
  FAMILY_CONTRADICTION: 'SYS.FAMILY_CONTRADICTION',
} as const

export interface IngestProcessorOptions {
  /** Confianza a partir de la cual la propuesta se acepta sin revisión. */
  autoThreshold: number
  /** Confianza mínima para llegar a la bandeja; por debajo va a cuarentena. */
  reviewThreshold: number
  /** Idioma del documento, para el rastro del OCR. */
  language: string
}

export type IngestOutcome =
  | {
      outcome: 'proposed'
      parsedRecordId: string
      entityId: string | null
      proposedFamily: string
      confidence: number
      verdict: string
    }
  | {
      outcome: 'quarantined'
      parsedRecordId: string
      quarantineId: string
      ruleCode: string
      reason: string
      proposedFamily: string
      confidence: number
    }

/** La familia declara el tipo de entidad que propone, si lo declara. */
function declaredEntityType(familySchema: unknown): string | null {
  if (typeof familySchema !== 'object' || familySchema === null) {
    return null
  }
  const declared = (familySchema as { entityType?: unknown }).entityType
  return typeof declared === 'string' && declared.trim() !== ''
    ? declared
    : null
}

/**
 * El esquema de la familia para el mapeo de campos. Acepta las dos formas
 * que hay en el repo: un JSON Schema (`properties`) o la lista de campos
 * (`fields`). Sin esquema no hay mapeo: el original queda extraído y listo.
 */
function fieldSchemaOf(familySchema: unknown): Record<string, unknown> | null {
  if (typeof familySchema !== 'object' || familySchema === null) {
    return null
  }
  const schema = familySchema as Record<string, unknown>
  if (typeof schema.properties === 'object' && schema.properties !== null) {
    return schema
  }
  if (Array.isArray(schema.fields) && schema.fields.length > 0) {
    const properties: Record<string, unknown> = {}
    for (const field of schema.fields) {
      if (typeof field !== 'object' || field === null) {
        continue
      }
      const name = (field as { name?: unknown }).name
      if (typeof name !== 'string') {
        continue
      }
      properties[name] = {
        type: (field as { type?: unknown }).type ?? 'string',
      }
    }
    if (Object.keys(properties).length === 0) {
      return null
    }
    return { type: 'object', properties }
  }
  return null
}

export class IngestProcessor {
  constructor(
    private readonly store: IngestPipelineStore,
    private readonly originals: OriginalsReader,
    private readonly engine: ProposalEngine,
    private readonly options: IngestProcessorOptions,
  ) {}

  async process(job: IngestJob): Promise<IngestOutcome> {
    const source = await this.store.findSourceFile(job.sourceFileId)
    if (!source) {
      throw new Error(
        `el archivo ${job.sourceFileId} no existe: el job ${job.jobId} no tiene archivo que procesar`,
      )
    }
    await this.store.markJobRunning(job.jobId)
    try {
      const outcome = await this.propose(source)
      await this.store.finishJob(job.jobId, {
        status: 'done',
        output: { ...outcome },
        error: null,
      })
      return outcome
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      await this.store.finishJob(job.jobId, {
        status: 'failed',
        output: null,
        error: reason,
      })
      throw error
    }
  }

  private async propose(
    source: SourceFileForProcessing,
  ): Promise<IngestOutcome> {
    const bytes = await this.originals.read(source.storagePath)
    const { text } = await this.engine.recognize({
      bytes,
      mimeType: source.mimeType,
    })

    const families = await this.store.listActiveFamilies(source.facilityId)
    const candidates = families.map((family) => family.code)
    const { label, confidence } = await this.engine.classify({
      text,
      candidates,
    })
    const verdict = classifyScore(
      confidence,
      this.options.autoThreshold,
      this.options.reviewThreshold,
    )

    const fields = await this.mapFields(source, text)
    const payload = {
      family: source.familyCode,
      proposedFamily: label,
      confidence,
      fields,
    }

    const contradicts = label !== source.familyCode
    if (verdict === 'quarantine' || contradicts) {
      return this.quarantine(source, payload, label, confidence, contradicts)
    }

    const parsed = await this.store.createParsedRecord({
      facilityId: source.facilityId,
      sourceFileId: source.id,
      familyConfigId: source.familyConfigId,
      recordIndex: 0,
      payload,
      status: 'parsed',
      createdById: source.receivedById,
    })
    await this.store.createOcrResult({
      facilityId: source.facilityId,
      sourceFileId: source.id,
      parsedRecordId: parsed.id,
      engine: 'vision-ocr',
      engineVersion: 'ocr.v1',
      language: this.options.language,
      textContent: text,
    })

    const entityId = await this.proposeEntity(source, fields)
    return {
      outcome: 'proposed',
      parsedRecordId: parsed.id,
      entityId,
      proposedFamily: label,
      confidence,
      verdict,
    }
  }

  /**
   * Cuarentena: el archivo se detiene con motivo visible y el original queda
   * intacto (RF-02). No se borra nada (REGLAS.md 5).
   */
  private async quarantine(
    source: SourceFileForProcessing,
    payload: Record<string, unknown>,
    proposedFamily: string,
    confidence: number,
    contradicts: boolean,
  ): Promise<IngestOutcome> {
    const ruleCode = contradicts
      ? SYSTEM_RULE.FAMILY_CONTRADICTION
      : SYSTEM_RULE.LOW_CONFIDENCE
    const reason = contradicts
      ? `La familia propuesta (${proposedFamily}) no es la declarada (${source.familyCode}).`
      : `La confianza de la propuesta (${confidence.toFixed(2)}) es menor que el umbral de revisión (${this.options.reviewThreshold}).`

    const parsed = await this.store.createParsedRecord({
      facilityId: source.facilityId,
      sourceFileId: source.id,
      familyConfigId: source.familyConfigId,
      recordIndex: 0,
      payload,
      status: 'quarantined',
      createdById: source.receivedById,
    })
    const quarantine = await this.store.createQuarantine({
      facilityId: source.facilityId,
      sourceFileId: source.id,
      parsedRecordId: parsed.id,
      ruleCode,
      severity: 'BLOQUEO',
      reason,
    })
    return {
      outcome: 'quarantined',
      parsedRecordId: parsed.id,
      quarantineId: quarantine.id,
      ruleCode,
      reason,
      proposedFamily,
      confidence,
    }
  }

  /**
   * La propuesta llega a la bandeja como `graph.entity` en
   * `pending_confirmation` con versión 1. El tipo de entidad lo declara la
   * familia en su `schema_definition`; si la familia no declara ninguno, la
   * extracción queda registrada y la propuesta espera a que la instalación
   * declare el tipo (los datos son de la instalación, ADR-0019).
   */
  private async proposeEntity(
    source: SourceFileForProcessing,
    fields: Record<string, unknown> | null,
  ): Promise<string | null> {
    const entityTypeCode = declaredEntityType(source.familySchema)
    if (entityTypeCode === null) {
      return null
    }
    const entityType = await this.store.findEntityType(
      source.facilityId,
      entityTypeCode,
    )
    if (!entityType) {
      return null
    }
    const entity = await this.store.createEntityProposal({
      facilityId: source.facilityId,
      entityTypeId: entityType.id,
      // El contenido es la identidad del documento: el mismo archivo produce
      // la misma propuesta y nunca choca con otra.
      code: source.sha256,
      data: fields ?? {},
      sourceFileId: source.id,
      createdById: source.receivedById,
    })
    return entity.id
  }

  private async mapFields(
    source: SourceFileForProcessing,
    text: string,
  ): Promise<Record<string, unknown> | null> {
    const schema = fieldSchemaOf(source.familySchema)
    if (schema === null) {
      return null
    }
    return this.engine.mapFields({ text, schema })
  }
}
