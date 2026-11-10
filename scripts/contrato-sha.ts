#!/usr/bin/env bun
/**
 * contrato-sha — freezes and verifies the data contract of C1 (#23).
 *
 * The contract is the set of files that dataset, seed and API must agree on:
 * the human contract (fichas/CONTRATO.md), the dataset expectation
 * (esperado.json) and the six machine schemas (dataset/config1/esquemas).
 *
 * Modes:
 *   bun scripts/contrato-sha.ts            check: recompute SHAs and compare
 *                                          against the frozen manifest. Exit 1
 *                                          on drift or missing manifest.
 *   bun scripts/contrato-sha.ts --freeze   write/refresh the manifest.
 *
 * The manifest contains no timestamps: freezing the same content twice
 * produces the same bytes, so the check is reproducible in CI.
 *
 * When the contract legitimately changes, the same PR must refresh the
 * manifest and register the new contract SHA in issue #23 (see
 * docs/ingenieria/CONTRATO-CONGELADO.md).
 */
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const REPO_ROOT = join(import.meta.dir, '..')
const CONTRACT_DOC = 'docs/ingenieria/fichas/CONTRATO.md'
const ESPERADO = 'dataset/config1/esperado.json'
const SCHEMAS_DIR = 'dataset/config1/esquemas'
const MANIFEST_PATH = 'dataset/config1/contrato-sha.json'

type Manifest = {
  version: 1
  files: Record<string, string>
  contract_sha: string
}

function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex')
}

function contractFiles(): string[] {
  const dir = join(REPO_ROOT, SCHEMAS_DIR)
  if (!existsSync(dir)) {
    console.error(`contrato-sha: missing directory ${SCHEMAS_DIR}`)
    process.exit(1)
  }
  const schemas = readdirSync(dir)
    .filter((name) => name.endsWith('.schema.json'))
    .sort()
    .map((name) => `${SCHEMAS_DIR}/${name}`)
  return [CONTRACT_DOC, ESPERADO, ...schemas]
}

function computeManifest(): Manifest {
  const files: Record<string, string> = {}
  for (const rel of contractFiles()) {
    const abs = join(REPO_ROOT, rel)
    if (!existsSync(abs)) {
      console.error(`contrato-sha: missing contract file ${rel}`)
      process.exit(1)
    }
    files[rel] = sha256(readFileSync(abs, 'utf8'))
  }
  const digest = Object.keys(files)
    .sort()
    .map((path) => `${path}  ${files[path]}`)
    .join('\n')
  return { version: 1, files, contract_sha: sha256(digest) }
}

function readFrozenManifest(): Manifest | null {
  const abs = join(REPO_ROOT, MANIFEST_PATH)
  if (!existsSync(abs)) return null
  return JSON.parse(readFileSync(abs, 'utf8')) as Manifest
}

function freeze(): void {
  const manifest = computeManifest()
  const abs = join(REPO_ROOT, MANIFEST_PATH)
  writeFileSync(abs, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  console.log(`contrato-sha: frozen ${MANIFEST_PATH}`)
  console.log(`contrato-sha: contract SHA-256 = ${manifest.contract_sha}`)
  console.log(
    `contrato-sha: ${Object.keys(manifest.files).length} files covered`,
  )
}

function check(): void {
  const frozen = readFrozenManifest()
  if (!frozen) {
    console.error(`contrato-sha: no frozen manifest at ${MANIFEST_PATH}`)
    console.error(
      'contrato-sha: run "bun run contrato:freeze" in the PR that changes the contract',
    )
    process.exit(1)
  }
  const current = computeManifest()
  const drifted = Object.keys(current.files).filter(
    (path) => frozen.files[path] !== current.files[path],
  )
  const removed = Object.keys(frozen.files).filter(
    (path) => !(path in current.files),
  )
  if (
    drifted.length === 0 &&
    removed.length === 0 &&
    frozen.contract_sha === current.contract_sha
  ) {
    console.log(`contrato-sha: OK — contract frozen at ${frozen.contract_sha}`)
    return
  }
  for (const path of drifted) console.error(`contrato-sha: DRIFT ${path}`)
  for (const path of removed) console.error(`contrato-sha: REMOVED ${path}`)
  if (frozen.contract_sha !== current.contract_sha) {
    console.error(
      `contrato-sha: contract_sha changed ${frozen.contract_sha} -> ${current.contract_sha}`,
    )
  }
  console.error(
    'contrato-sha: FAIL — refresh the manifest with "bun run contrato:freeze" in the same PR and register the new SHA in issue #23',
  )
  process.exit(1)
}

const isFreeze = process.argv.includes('--freeze')
if (isFreeze) freeze()
else check()
