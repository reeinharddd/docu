---
name: docu-documentar
description: How documentation is written and placed in DOCU - taxonomy by type, ADR, briefs, verifiable index and authority layers. Use before creating, moving or editing any file in docs/.
---
<!--
owner: reeinharddd
trigger: before touching docs/
purpose: Taxonomy, ADR, briefs and the document index
-->

# Documenting in DOCU

System law: `docs/README.md`. This skill summarizes what is most often
forgotten.

## Where each thing goes

| If it is... | It goes in |
|---|---|
| Why X was chosen over Y | `docs/decisiones/ADR-NNNN-*.md` (template `docs/plantillas/ADR.md`) |
| How it is built today | `docs/ingenieria/` |
| How it is used and looks | `docs/diseno/` (no code filenames) |
| How to start it or how it breaks | `docs/operacion/` |
| How to talk to an external system | `docs/integraciones/` |
| Delegation of a task | `docs/briefs/BRIEF-<issue>-<slug>.md` |
| Course deliverables | Drive (live); not versioned in the repo |
| Task status | GitHub Issue, never a document |
| Session context | Agent memory, never a document |

## Rules

1. Spanish in docs, English in code, configuration and agent-consumed files
   (`AGENTS.md`, `CLAUDE.md`, `.opencode/`).
2. An ADR is never rewritten: write the next one with `Reemplazada por`.
3. Architecture describes the present; the future goes as an ADR or an issue.
4. No secrets or `.env` values, only variable names.
5. Any version mentioned = the real version in the `package.json` files.
6. Every new or deleted file in `docs/` is reflected with `bash scripts/doc-index.sh --fix`. CI fails if the index lies.
7. Every document has an owner in `docs/proyecto/EQUIPO.md`.
