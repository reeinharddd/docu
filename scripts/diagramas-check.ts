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

const DIRECTORIES = ['docs']
const ROOT_MD = ['README.md', 'AGENTS.md', 'CLAUDE.md']

type Block = { file: string; line: number; source: string }

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path, out)
    else if (entry.name.endsWith('.md') || entry.name.endsWith('.mmd'))
      out.push(path)
  }
  return out
}

function blocksOf(file: string): Block[] {
  const lines = readFileSync(file, 'utf8').split('\n')
  if (file.endsWith('.mmd')) {
    return [{ file, line: 1, source: lines.join('\n') }]
  }
  const out: Block[] = []
  let inside = false
  let start = 0
  let buffer: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    if (!inside && /^\s*```mermaid\b/.test(l)) {
      inside = true
      start = i + 2
      buffer = []
      continue
    }
    if (inside && /^\s*```\s*$/.test(l)) {
      inside = false
      out.push({ file, line: start, source: buffer.join('\n') })
      continue
    }
    if (inside) buffer.push(l)
  }
  return out
}

/** A block with only directives/comments is not a diagram: it is ignored. */
function onlyDirectives(source: string): boolean {
  return (
    source
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

const files = [
  ...DIRECTORIES.flatMap((d) => walk(d)),
  ...ROOT_MD.filter((f) => {
    try {
      readFileSync(f, 'utf8')
      return true
    } catch {
      return false
    }
  }),
]

const blocks = files.flatMap(blocksOf).filter((b) => !onlyDirectives(b.source))

let broken = 0
for (const b of blocks) {
  try {
    await mermaid.parse(b.source)
  } catch (e) {
    broken++
    const msg = String((e as Error)?.message ?? e)
      .replace(/\s+/g, ' ')
      .slice(0, 200)
    console.error(`✗ ${b.file}:${b.line} — ${msg}`)
  }
}

// ── draw.io: every page of the .drawio has its exported SVG ────────────────
const DRAWIO_DIR = 'docs/ingenieria'
const SVG_DIR = join(DRAWIO_DIR, 'diagramas')
const expected = new Set<string>()
let pages = 0
let problems = 0
let totalTables = 0

for (const entry of readdirSync(DRAWIO_DIR, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.drawio')) continue
  const file = join(DRAWIO_DIR, entry.name)
  const base = entry.name.slice(0, -'.drawio'.length)
  const doc = new JSDOM(readFileSync(file, 'utf8'), {
    contentType: 'text/xml',
  }).window.document
  if (doc.querySelector('parsererror')) {
    problems++
    console.error(`✗ ${file} — invalid XML`)
    continue
  }
  const total = doc.querySelectorAll('diagram').length
  if (total === 0) {
    problems++
    console.error(`✗ ${file} — no <diagram>`)
    continue
  }
  for (let i = 1; i <= total; i++) {
    pages++
    const name = `${base}-${i}.svg`
    expected.add(name)
    if (!existsSync(join(SVG_DIR, name))) {
      problems++
      console.error(`✗ ${file} — page ${i} without export: ${SVG_DIR}/${name}`)
    }
  }

  // ── traceability: the derived .md declares the hash and the tables ─────────────
  const uniqueTables = [
    ...new Set(
      [
        ...readFileSync(file, 'utf8').matchAll(
          /<mxCell[^>]*\bvalue="([^"]+)"[^>]*\bstyle="[^"]*shape=table[;"]/g,
        ),
      ]
        .map((m) => m[1])
        .filter((v) => /^[a-z][a-z0-9_]*$/.test(v)),
    ),
  ]
  totalTables += uniqueTables.length

  const mdFile = join(DRAWIO_DIR, `${base}.md`)
  if (!existsSync(mdFile)) {
    problems++
    console.error(`✗ ${file} — no derived text: ${mdFile}`)
  } else {
    const text = readFileSync(mdFile, 'utf8')

    const hash = createHash('sha256').update(readFileSync(file)).digest('hex')
    // The marker and the section title below are Spanish on purpose: they match
    // the wording of the derived document, which is human-consumed.
    const declared = text.match(/SHA-256 de la fuente:\s*`([0-9a-f]{64})`/i)
    if (!declared) {
      problems++
      console.error(`✗ ${mdFile} — does not declare the source SHA-256`)
    } else if (declared[1] !== hash) {
      problems++
      console.error(
        `✗ ${mdFile} — stale SHA-256: declares ${declared[1]}, source is ${hash}`,
      )
    }

    const section =
      text.split('## Matriz de clases')[1]?.split('\n## ')[0] ?? ''
    const inText = new Set(
      [...section.matchAll(/^\|\s*`([a-z][a-z0-9_]*)`\s*\|/gm)].map(
        (m) => m[1],
      ),
    )
    for (const t of uniqueTables) {
      if (!inText.has(t)) {
        problems++
        console.error(
          `✗ ${mdFile} — table \`${t}\` in the diagram is not in the class matrix`,
        )
      }
    }
    for (const t of inText) {
      if (!uniqueTables.includes(t)) {
        problems++
        console.error(
          `✗ ${mdFile} — table \`${t}\` in the matrix is not in the diagram`,
        )
      }
    }
  }
}

if (existsSync(SVG_DIR)) {
  for (const entry of readdirSync(SVG_DIR)) {
    if (entry.endsWith('.svg') && !expected.has(entry)) {
      problems++
      console.error(`✗ ${SVG_DIR}/${entry} — SVG with no page in the .drawio`)
    }
  }
}

if (broken > 0 || problems > 0) {
  console.error(`diagrams: ${blocks.length} mermaid blocks, ${broken} broken`)
  console.error(`drawio: ${pages} pages, ${problems} problems`)
  process.exit(1)
}
console.log(`diagrams: ${blocks.length} mermaid blocks, 0 broken`)
console.log(
  `drawio: ${pages} pages, ${totalTables} tables traced to text, 0 problems`,
)
