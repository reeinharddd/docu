#!/usr/bin/env bun
/**
 * diagramas-check — validates that the repo's diagrams are not broken.
 *
 * 1. Mermaid: extracts every ```mermaid block from .md files (and every .mmd)
 *    and runs it through the parser. Fails with file:line if any is broken.
 * 2. draw.io: checks that every `ingenieria/*.drawio` is valid XML, has pages,
 *    and that each page has its exported SVG in `ingenieria/diagramas/`
 *    (and that no orphan SVG is left behind).
 * 3. Source-to-text traceability: the derived `.md` declares the SHA-256 of the
 *    `.drawio`, and every table in the diagram must be in the class matrix of
 *    the `.md` (and vice versa). Editing the diagram forces updating the text:
 *    they cannot drift silently.
 *
 * Standard: docs/ingenieria/DIAGRAMAS.md (ADR-0017). Runs in `bun run verify`
 * and in CI. Does not render to an image: the ER export is `bun run diagramas:drawio`.
 */
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { JSDOM } from 'jsdom'

const DIRECTORIOS = ['docs']
const MD_RAIZ = ['README.md', 'AGENTS.md', 'CLAUDE.md']

type Bloque = { archivo: string; linea: number; fuente: string }

function caminar(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue
    const p = join(dir, e.name)
    if (e.isDirectory()) caminar(p, out)
    else if (e.name.endsWith('.md') || e.name.endsWith('.mmd')) out.push(p)
  }
  return out
}

function bloquesDe(archivo: string): Bloque[] {
  const lineas = readFileSync(archivo, 'utf8').split('\n')
  if (archivo.endsWith('.mmd')) {
    return [{ archivo, linea: 1, fuente: lineas.join('\n') }]
  }
  const out: Bloque[] = []
  let dentro = false
  let inicio = 0
  let buf: string[] = []
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i]
    if (!dentro && /^\s*```mermaid\b/.test(l)) {
      dentro = true
      inicio = i + 2
      buf = []
      continue
    }
    if (dentro && /^\s*```\s*$/.test(l)) {
      dentro = false
      out.push({ archivo, linea: inicio, fuente: buf.join('\n') })
      continue
    }
    if (dentro) buf.push(l)
  }
  return out
}

/** Un bloque con solo directivas/comentarios no es un diagrama: se ignora. */
function soloDirectivas(src: string): boolean {
  return (
    src
      .replace(/%%\{[\s\S]*?\}%%/g, '')
      .replace(/%%[^\n]*/g, '')
      .trim().length === 0
  )
}

const dom = new JSDOM('<!doctype html><html><body></body></html>')
;(globalThis as Record<string, unknown>).window = dom.window
;(globalThis as Record<string, unknown>).document = dom.window.document
;(globalThis as Record<string, unknown>).DOMPurify = {
  sanitize: (s: string) => s,
  addHook: () => {},
}

const mermaid = (await import('mermaid')).default
mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' })

const archivos = [
  ...DIRECTORIOS.flatMap((d) => caminar(d)),
  ...MD_RAIZ.filter((f) => {
    try {
      readFileSync(f, 'utf8')
      return true
    } catch {
      return false
    }
  }),
]

const bloques = archivos
  .flatMap(bloquesDe)
  .filter((b) => !soloDirectivas(b.fuente))

let rotos = 0
for (const b of bloques) {
  try {
    await mermaid.parse(b.fuente)
  } catch (e) {
    rotos++
    const msg = String((e as Error)?.message ?? e)
      .replace(/\s+/g, ' ')
      .slice(0, 200)
    console.error(`✗ ${b.archivo}:${b.linea} — ${msg}`)
  }
}

// ── draw.io: every page of the .drawio has its exported SVG ────────────────
const DRAWIO_DIR = 'docs/ingenieria'
const SVG_DIR = join(DRAWIO_DIR, 'diagramas')
const esperados = new Set<string>()
let paginas = 0
let problemas = 0
let tablasTotales = 0

for (const e of readdirSync(DRAWIO_DIR, { withFileTypes: true })) {
  if (!e.isFile() || !e.name.endsWith('.drawio')) continue
  const archivo = join(DRAWIO_DIR, e.name)
  const base = e.name.slice(0, -'.drawio'.length)
  const doc = new JSDOM(readFileSync(archivo, 'utf8'), {
    contentType: 'text/xml',
  }).window.document
  if (doc.querySelector('parsererror')) {
    problemas++
    console.error(`✗ ${archivo} — XML inválido`)
    continue
  }
  const total = doc.querySelectorAll('diagram').length
  if (total === 0) {
    problemas++
    console.error(`✗ ${archivo} — sin <diagram>`)
    continue
  }
  for (let i = 1; i <= total; i++) {
    paginas++
    const nombre = `${base}-${i}.svg`
    esperados.add(nombre)
    if (!existsSync(join(SVG_DIR, nombre))) {
      problemas++
      console.error(
        `✗ ${archivo} — página ${i} sin export: ${SVG_DIR}/${nombre}`,
      )
    }
  }

  // ── traceability: the derived .md declares the hash and the tables ─────────────
  const tablasUnicas = [
    ...new Set(
      [
        ...readFileSync(archivo, 'utf8').matchAll(
          /<mxCell[^>]*\bvalue="([^"]+)"[^>]*\bstyle="[^"]*shape=table[;"]/g,
        ),
      ]
        .map((m) => m[1])
        .filter((v) => /^[a-z][a-z0-9_]*$/.test(v)),
    ),
  ]
  tablasTotales += tablasUnicas.length

  const md = join(DRAWIO_DIR, `${base}.md`)
  if (!existsSync(md)) {
    problemas++
    console.error(`✗ ${archivo} — sin texto derivado: ${md}`)
  } else {
    const texto = readFileSync(md, 'utf8')

    const hash = createHash('sha256')
      .update(readFileSync(archivo))
      .digest('hex')
    const declarado = texto.match(/SHA-256 de la fuente:\s*`([0-9a-f]{64})`/i)
    if (!declarado) {
      problemas++
      console.error(`✗ ${md} — no declara el SHA-256 de la fuente`)
    } else if (declarado[1] !== hash) {
      problemas++
      console.error(
        `✗ ${md} — SHA-256 desactualizado: dice ${declarado[1]}, la fuente es ${hash}`,
      )
    }

    const seccion =
      texto.split('## Matriz de clases')[1]?.split('\n## ')[0] ?? ''
    const delTexto = new Set(
      [...seccion.matchAll(/^\|\s*`([a-z][a-z0-9_]*)`\s*\|/gm)].map(
        (m) => m[1],
      ),
    )
    for (const t of tablasUnicas) {
      if (!delTexto.has(t)) {
        problemas++
        console.error(
          `✗ ${md} — la tabla \`${t}\` del diagrama no está en la matriz de clases`,
        )
      }
    }
    for (const t of delTexto) {
      if (!tablasUnicas.includes(t)) {
        problemas++
        console.error(
          `✗ ${md} — la tabla \`${t}\` de la matriz no está en el diagrama`,
        )
      }
    }
  }
}

if (existsSync(SVG_DIR)) {
  for (const e of readdirSync(SVG_DIR)) {
    if (e.endsWith('.svg') && !esperados.has(e)) {
      problemas++
      console.error(`✗ ${SVG_DIR}/${e} — SVG sin página en el .drawio`)
    }
  }
}

if (rotos > 0 || problemas > 0) {
  console.error(`diagramas: ${bloques.length} bloques mermaid, ${rotos} rotos`)
  console.error(`drawio: ${paginas} páginas, ${problemas} problemas`)
  process.exit(1)
}
console.log(`diagramas: ${bloques.length} bloques mermaid, 0 rotos`)
console.log(
  `drawio: ${paginas} páginas, ${tablasTotales} tablas trazadas al texto, 0 problemas`,
)
