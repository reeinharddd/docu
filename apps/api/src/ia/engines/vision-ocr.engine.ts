/**
 * OCR/KIE engine over the centralized transport (ADR-0020, OCR.md). The
 * default model is GLM-OCR 0.9B served as a vision chat model; the page
 * travels as a base64 data URI. GLM-OCR does not return calibrated
 * confidence — the confidence that orders human review comes from the
 * in-process scoring engine (Laya), owned by the classification lane.
 */

import { EngineError } from '../errors.js'
import { type OpenAiCompatClient, readUsage } from '../openai-client.js'
import type {
  CallContext,
  OcrEngine,
  OcrInput,
  OcrOutput,
  TokenUsage,
} from '../types.js'

const DEFAULT_OCR_PROMPT =
  'Extrae el contenido textual completo del documento, preservando layout, ' +
  'tablas y campos clave. Devuelve solo el texto extraído.'

function toDataUri(bytes: Uint8Array, mimeType: string): string {
  const base64 = Buffer.from(bytes).toString('base64')
  return `data:${mimeType};base64,${base64}`
}

export class VisionOcrEngine implements OcrEngine {
  readonly kind = 'ocr' as const

  constructor(
    private readonly client: OpenAiCompatClient,
    readonly model: string,
    private readonly prompt: string = DEFAULT_OCR_PROMPT,
  ) {}

  async recognize(input: OcrInput, ctx: CallContext): Promise<OcrOutput> {
    if (input.bytes.byteLength === 0) {
      throw new EngineError(
        'OCR input is empty: no bytes to recognize.',
        this.model,
      )
    }
    const dataUri = toDataUri(input.bytes, input.mimeType)
    ctx.assertBudget(Math.ceil(dataUri.length / 4))

    const response = await this.client.chat(
      {
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: dataUri } },
              { type: 'text', text: input.prompt ?? this.prompt },
            ],
          },
        ],
      },
      ctx.signal,
    )

    const text = response.choices[0]?.message.content ?? ''
    if (text.trim() === '') {
      throw new EngineError(
        'OCR returned no text: the page is unreadable or the model failed. Route to quarantine with a reason.',
        this.model,
      )
    }
    const usage: TokenUsage | undefined = readUsage(response.usage)
    return usage === undefined ? { text } : { text, usage }
  }
}
