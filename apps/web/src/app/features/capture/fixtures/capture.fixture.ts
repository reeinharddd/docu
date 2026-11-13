/**
 * DEMO ONLY — simulates the ingest pipeline (POST /v1/files and its
 * validation) until the API (#12) lands. The family and the rule outcome
 * are guessed from the file name with the case's own documents, so the
 * walkthrough of G1/G2/G3/G5 works with any file the person drops.
 */
import type { DemoRoute } from '../../../core/middleware/api/demo-backend'
import type { FamilyCode } from '../../../core/types/catalog'
import type { FileValidation, UploadReceipt } from '../model/capture'

/** The case's own documents, offered as one-click samples in the demo. */
export const SAMPLE_FILES: ReadonlyArray<{ name: string; type: string }> = [
  {
    name: 'recepcion-sab-24oct.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  {
    name: 'turno-TP01-T1-2026-10-26.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  { name: 'peel-test-L2610-07.pdf', type: 'application/pdf' },
  { name: 'aviso-embarque-tyvek.eml', type: 'message/rfc822' },
  {
    name: 'programa-semana44-rev4.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
]

type Outcome = Omit<FileValidation, 'sourceFileId' | 'fileName' | 'sha256'>

export function guessValidation(
  fileName: string,
  declared: FamilyCode | null,
): Outcome {
  const name = fileName.toLowerCase()
  const family = declared ?? guessFamily(name)
  const familySource: Outcome['familySource'] = declared
    ? 'declared'
    : family
      ? 'detected'
      : 'ai'

  switch (family) {
    case 'recepcion_rollo':
      return {
        family,
        familySource,
        decision: 'quarantine',
        rules: [
          {
            code: 'R-P1',
            passed: false,
            message: 'R-017 llegó sin certificado.',
          },
          {
            code: 'R-P2',
            passed: false,
            message: 'R-019 mide 248 mm; la orden pide 250 mm.',
          },
        ],
        summary:
          'Dos rollos quedan detenidos: R-017 sin certificado y R-019 de calibre menor.',
        searchKey: 'R-017',
      }
    case 'excel_turno':
      return {
        family,
        familySource,
        decision: 'quarantine',
        rules: [
          {
            code: 'R-A1',
            passed: false,
            message: 'Paro de 45 min sin motivo en TP-01 · T1.',
          },
        ],
        summary:
          'El turno se leyó completo, pero el paro de 45 min no trae motivo.',
        searchKey: 'TP-01',
      }
    case 'escaneado':
      return {
        family,
        familySource,
        decision: 'human_review',
        rules: [
          {
            code: 'R-Q1',
            passed: true,
            message: 'Firma presente; falta que Calidad confirme.',
          },
        ],
        summary:
          'Peel test leído. Espera la confirmación de Calidad para liberar.',
        searchKey: 'R-021',
      }
    case 'correo_hermana':
      return {
        family,
        familySource,
        decision: 'human_review',
        rules: [
          {
            code: 'R-P4',
            passed: false,
            message:
              'Cambia lote y fecha del Tyvek: ORD-2026-0042, 0043 y 0048 pasan a replan.',
          },
        ],
        summary:
          'El correo cambia tres órdenes; el reporte anterior queda pausado.',
        searchKey: 'ORD-2026-0042',
      }
    case 'programa_planeacion':
    case 'inventario':
      return {
        family,
        familySource,
        decision: 'valid',
        rules: [
          {
            code: 'R-P3',
            passed: true,
            message: 'El material programado existe en almacén.',
          },
          {
            code: 'R-T1',
            passed: true,
            message: 'Film y Tyvek arriba del mínimo.',
          },
        ],
        summary: 'Pasó la validación. Ya se puede consultar con su origen.',
        searchKey: family === 'inventario' ? 'MAT-TYV-01' : 'ORD-2026-0042',
      }
    default:
      return {
        family: null,
        familySource: 'ai',
        decision: 'human_review',
        rules: [],
        summary: 'No se reconoció la familia. Una persona tiene que asignarla.',
        searchKey: null,
      }
  }
}

function guessFamily(name: string): FamilyCode | null {
  if (
    name.endsWith('.eml') ||
    name.includes('correo') ||
    name.includes('aviso')
  ) {
    return 'correo_hermana'
  }
  if (name.includes('recepcion') || name.includes('certificado'))
    return 'recepcion_rollo'
  if (name.includes('turno')) return 'excel_turno'
  if (
    name.includes('peel') ||
    name.includes('escaneo') ||
    name.includes('liberacion')
  ) {
    return 'escaneado'
  }
  if (name.includes('programa')) return 'programa_planeacion'
  if (name.includes('inventario') || name.includes('conteo'))
    return 'inventario'
  return null
}

/** Not a real hash: a stable 64-hex fingerprint of the name, for the demo. */
export function demoFingerprint(text: string): string {
  let out = ''
  let h = 2166136261
  for (let round = 0; round < 8; round++) {
    for (const ch of `${round}:${text}`) {
      h ^= ch.charCodeAt(0)
      h = Math.imul(h, 16777619) >>> 0
    }
    out += h.toString(16).padStart(8, '0')
  }
  return out
}

export function captureDemoRoutes(): DemoRoute[] {
  const files = new Map<string, FileValidation>()
  let next = 1

  return [
    {
      method: 'POST',
      path: /^\/files$/,
      respond: ({ body }) => {
        const form = body instanceof FormData ? body : null
        const file = form?.get('file')
        const fileName = file instanceof File ? file.name : null
        if (!fileName) {
          return {
            status: 422,
            body: {
              code: 'VALIDATION_ERROR',
              message: 'No llegó ningún archivo.',
            },
          }
        }
        const sha256 = demoFingerprint(fileName)
        const duplicate = [...files.values()].find((f) => f.sha256 === sha256)
        if (duplicate) {
          return {
            status: 409,
            body: {
              code: 'CONFLICT',
              message: `Este archivo ya se subió: ${duplicate.fileName} tiene la misma huella.`,
              details: { sourceFileId: duplicate.sourceFileId },
            },
          }
        }
        const declared = form?.get('family')
        const family =
          typeof declared === 'string' && declared
            ? (declared as FamilyCode)
            : null
        const sourceFileId = `sf-${String(next++).padStart(4, '0')}`
        files.set(sourceFileId, {
          sourceFileId,
          fileName,
          sha256,
          ...guessValidation(fileName, family),
        })
        const receipt: UploadReceipt = { sourceFileId, sha256 }
        return { status: 201, body: receipt }
      },
    },
    {
      method: 'GET',
      path: /^\/files\/([^/]+)\/validation$/,
      respond: ({ match }) => {
        const found = match[1] ? files.get(match[1]) : undefined
        return found
          ? { body: found }
          : {
              status: 404,
              body: { code: 'NOT_FOUND', message: 'Ese archivo no existe.' },
            }
      },
    },
  ]
}
