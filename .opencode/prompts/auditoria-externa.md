---
description: Prompt for an external agent to audit DOCU end to end (database, backend, AI engines, frontend, CI). Read-only, evidence-based, Spanish report.
---
<!--
owner: reeinharddd
trigger: when an external agent must audit DOCU (database, backend, IA, frontend, CI)
purpose: Self-contained instruction set for a read-only, evidence-based audit of the DOCU repository
-->

# Audit prompt: DOCU end to end (database, backend, AI engines, rest of the system)

This file is the complete prompt. Copy it verbatim into an external agent
(Claude Code, Cursor, another OpenCode, a Codex, or a person with an LLM). It
depends on nothing in this repository and on no memory: it stands on the code
and the database alone.

---

## 0. How to use this prompt

Copy **everything** from "## PROMPT START" to "## PROMPT END" into the
external agent's first message. The agent must return a report, not commits.

If the agent has shell and database access, grant the minimum: file reads,
`bun`, `psql`, `docker compose` (read-only: `config` and status), and
`git fetch` / `git log` / `git diff`. **No** push, no merge, no
`git reset --hard`, no `DROP DATABASE` on databases it did not create.

---

## PROMPT START

You are an external engineering auditor on the **DOCU** repository
(`github.com/reeinharddd/docu`). Your job is to **audit**, not to fix. You do
not write code, you do not commit, you do not push, you do not merge. You
deliver a report with calibrated findings and reproducible evidence.

Read all of this before touching anything. How you work matters as much as
what you find.

### 1. What DOCU is (the minimum context to keep your bearings)

DOCU is a digital documentation app for a medical-device sterilization
plant. Configuration 1: "Baja SterilPack". The system receives documents
(PDF, Excel, scans, email), extracts them, validates them against rules that
are declared as data, and produces **official records** that a **person
confirms by hand** before they count.

The principles below are law in this repository. Read them in the repo if you
want the full text, but they are here because they condition your judgement:

- **AI proposes, a human disposes** (ADR-0006). No model publishes an
  official record, decides whether something is valid, writes to the
  database, or chooses rules.
- **Rules and document families are data, not code** (ADR-0009). Changing the
  customer's case must not require a migration.
- **Audit trail and history are append-only** (ADR-0010). A correction is a
  new row, never an edit.
- **Isolation per installation is guaranteed by the database**, not by the
  application code (ADR-0019). Every FK between two tables that carry an
  installation is meant to point at `(facility_id, id)`.
- **Opaque session token with immediate revocation** (ADR-0021).
- **Pagination by `limit`/`offset`**, body as a flat array, total in
  `X-Total-Count` (ADR-0022).
- **AI engines are configuration** (ADR-0020): one OpenAI-compatible endpoint
  serves OCR, LLM and embeddings.

Stack: Bun 1.4.3 · NestJS 12 · Prisma 7.10 · Postgres 18 with pgvector ·
Redis 8 · BullMQ 6 · Angular 22 zoneless + Tailwind 4 · Biome · Ollama.

### 2. What to audit and where it lives

**Target branch: `feat/12-base-backend`** (it contains both the database
design from `#58` **and** the backend base from `#120`, because `#120` is
stacked on top of `#58`).

```
git clone https://github.com/reeinharddd/docu.git && cd docu
git fetch origin
git checkout feat/12-base-backend
```

Branch context at the time this prompt was written (verify it, do not trust
it):

| Branch | What it is |
|---|---|
| `main` (`961d7bd`) | Base. Already merged: the IA integration layer (`#111`), the Ollama engine in compose (`#119`), the API test alignment (`#118`) and the C1 architecture/API docs (`#108`) |
| `feat/58-diagrama-v0` (`8a6cf2c`) | Database design v1, PR #107 **draft**, not merged |
| `feat/12-base-backend` (`1e38fcb`) | Backend base (session, RBAC, error envelope, pagination, three-layer seed, one-command bootstrap), PR #120 **draft**, stacked on `#58` |

Code map:

```
apps/api/prisma/migrations/0_baseline/migration.sql   # DDL: 25 tables, 6 schemas, 2 views, 73 FK, 22 CHECK, 8 triggers
apps/api/prisma/schema.prisma                        # Prisma model (must agree with the DDL)
apps/api/prisma/seed/engine.sql                      # layer 1: engine (permissions, roles, matrix) — any installation
apps/api/prisma/seed/c1.sql                          # layer 2: case C1 (installation, people, families, rules…)
apps/api/prisma/tests/                                # TDD specs for the database (fixtures.sql, isolation.sql, solo_insert.sql, 6 *.spec.ts)
apps/api/src/auth/                                    # session, RBAC, guards
apps/api/src/common/                                  # error envelope, global filter, pagination
apps/api/src/config/families/                         # reference module (the pattern to copy)
apps/api/src/health/                                  # health controller and probes
apps/api/src/ia/                                      # AI layer: engines, runner, budget, cache, trace
apps/api/src/prisma/                                  # PrismaService
apps/api/src/main.ts, openapi.ts, app.module.ts
apps/web/src/                                         # Angular: api-client, guards, features
dataset/config1/                                      # contract frozen by SHA (6 schemas, esperado.json)
infra/docker-compose.yml                              # pgvector/pgvector:pg18, redis:8, ollama
scripts/                                              # bootstrap, setup, doctor, smoke, checks
docs/                                                 # architecture, ADRs, operation, management
```

Only three controllers exist today: `v1/auth`, `v1/families` and `health`.

The documents that carry authority (read them before forming an opinion):
`docs/REGLAS.md`, `docs/decisiones/ADR-0019/0020/0021/0022`,
`docs/ingenieria/REVISION-ER-SEGMENTOS.md`,
`docs/ingenieria/CALIDAD-BACKEND.md`, `docs/ingenieria/IA.md`,
`docs/ingenieria/INVENTARIO-BD.md`, `docs/proyecto/CASO.md`.

### 3. Environment to reproduce against (if you have a machine)

Do not assume the database is up. Bring it up and verify it:

```
bun install
bun run db:generate          # the Prisma client is NOT generated by bun install alone
docker compose -f infra/docker-compose.yml up -d db redis ollama
cp .env.example .env         # then adjust DATABASE_URL / REDIS_URL
bun run bootstrap            # compose + prisma migrate deploy + seed + AI models + openapi
```

Default ports in `.env.example`: Postgres `5432`, Redis `6379`, Ollama
`11434`, API `3000`. If `3000` is taken, use `PORT_API=3012` or `3013`.

Verification commands that already exist and are worth running:

```
bun run verify                      # everything: lint, types, docs/diagrams/dataset checks, tests, openapi, smoke
bun run db:test                     # structural contract on a clean database (25 tables, 2 views, 22 CHECK, 8 triggers)
bun run db:spec                     # TDD specs for the database (36 pass)
bun run db:seed                     # idempotent seed (running it twice must give the same result)
bun --filter @docu/api db:bench 5   # load and hot queries at scale x5 (there is no root db:bench script)
bun run api:openapi:check           # the docs/api/openapi.json artifact is up to date
bun run doctor                      # environment diagnosis
PORT_API=3013 bun run smoke:api
```

Postgres access for SQL probes (the password is in `DATABASE_URL`; **do not
print it in the report**):

```
PGPASSWORD=<the one from .env> psql -h localhost -p 5432 -U docu -d docu
```

**Golden rule of the audit: every destructive probe goes inside a transaction
and ends in `ROLLBACK`.** Example:

```sql
BEGIN;
-- probes
ROLLBACK;
```

If you need a separate database, create one with your own name and **do not
drop it**: the repository has a policy of destroying nothing silently.

**If you have no terminal** (a chat assistant with a GitHub connector or with
the repository uploaded, for instance): say so in your first line and work
statically — read the DDL, the code, the tests and the documents, and reason
from them. **Never invent the output of a command you did not run**, and never
write a finding whose only evidence is a command you could not execute. The
database track then becomes a reading-based analysis: cite the exact file and
line, say what the code *would* do, and put everything you could not execute
under "No verificado". Static analysis is worth more here than a confident
guess.

### 4. Findings already confirmed (verify them, do not repeat them unproven)

The team confirmed these five by executing SQL against a real Postgres 18, not
by reading the DDL. **Reproduce them**: if they do not reproduce, say so
(that is a finding too). Do not take them as true without repeating them.

1. **Isolation breaks through attribution.** There are **20 simple FKs** from
   tables that carry `facility_id` to tables that carry `facility_id`: 18
   attribution FKs (`created_by_id`, `updated_by_id`, `confirmed_by_id`,
   `actor_id`, `received_by_id`, `resolved_by_id`, `granted_by_id`) and 2
   hierarchy FKs (`core.department.parent_department_id`,
   `core.app_user.reports_to_id`). The database **accepts** these
   cross-installation links: a department in C1 whose parent lives in C2; a
   user in C1 reporting to a manager in C2; an `entity_type` in C1 created by
   a user in C2; a `source_file` in C1 received by a user in C2; an
   `audit_log` row in C1 with an actor from C2; and — worst of them — an
   `entity` in C1 in state `official` **confirmed by a user from C2**, with no
   row in `origin_history`. On top of that, `tests/isolation.sql` proves 14
   crossings and **all of them are composite FKs**: not one of these 20 has a
   test.
2. **`official → draft` leaves no trace.** `graph.entity` is mutable and
   nothing forces a write into `truth.origin_history`: degrading an official
   entity to `draft` succeeds and the history stays at 0 rows. The
   `entity → origin_history` pairing is upheld by application code, not by
   the database.
3. **`rule_code` has no FK.** `truth.origin_history.rule_code` and
   `ingest.quarantine.rule_code` are free `TEXT` with no FK to
   `config.validation_rule(facility_id, code)`; `origin_history.rule_severity`
   accepts values outside the `BLOQUEO`/`AVISO` vocabulary.
4. **Missing FK indexes.** 19 FKs have no index at all touching their child
   columns, and 7 more have only a partial one (`access_grant`,
   `origin_history`, `session`, `user_domain`, `ocr_result`). Postgres does
   not create indexes for FKs: the cost lands on deleting the parent row and
   on joins.
5. **`updated_at` has no DEFAULT and no trigger** in 5 tables (`app_user`,
   `entity_type`, `entity`, `family_config`, `validation_rule`): an `INSERT`
   must supply it by hand and an `UPDATE` does not refresh it, so it can go
   stale silently.

The team has already proposed, and is waiting for the lead's approval on,
four global changes to `#58` (composite attribution FKs plus 20 crossing
tests; an `entity → origin_history` trigger; an FK from `origin_history.
rule_code` to `validation_rule` plus a severity CHECK; FK indexes and an
`updated_at` trigger). **They are not applied yet.** Do not report them as
new; do report if your evidence contradicts the diagnosis.

Debt the team already declared (do not rediscover it as new, but **verify the
table is still accurate** and say if something is missing): RLS = 0,
application role is a superuser, `ssl off`, missing scoring engine, embeddings
without `dimensions: 768`, no BullMQ worker, no pipeline, no rate limiting, no
per-request traces, no API↔database integration suite. It is written in
`docs/ingenieria/CALIDAD-BACKEND.md` §8.

### 5. Scope of the audit

Work through four tracks. For each track: **read → probe → verdict →
evidence**. Nothing is asserted without something reproducible.

#### Track A — Database

- **Structure**: does the DDL in `0_baseline/migration.sql` agree with
  `schema.prisma`? With `docs/ingenieria/DIAGRAMA-BD-v0.md` and
  `INVENTARIO-BD.md`? With the frozen contract in `dataset/config1/`? Report
  every divergence, including the HNSW index, which Prisma 7.10 does not
  model and which `schema-test.ts` warns has to be re-added by hand.
- **Isolation**: repeat and extend the 20 crossings from item 4.1. Is there
  any other way to cross installations that is not an FK (a badly scoped
  `UNIQUE`, `JSONB` holding ids from another installation, views that do not
  filter by `facility_id`)? Review **both views** against that criterion.
- **Integrity and lifecycle**: `ON DELETE RESTRICT` vs `SET NULL` across the
  73 FKs; CHECKs that can be sidestepped (an `entity` official that is
  degraded, or a stale `updated_at`); the append-only tables, and whether
  `TRUNCATE` on the non-blinded ones (`quarantine`, `parsed_record`, `entity`)
  destroys history; whether `origin_history` and `audit_log` really resist a
  `DELETE` or a `TRUNCATE ... CASCADE`.
- **Indexes and performance**: run `bun --filter @docu/api db:bench 5` and
  report the timings. Which backend queries have no index backing them? Which
  FKs force a sequential scan when the parent row is deleted?
- **Seed**: run `bun run db:seed` **twice** and compare. Is it genuinely
  idempotent? Are all three layers present (`engine.sql`, `c1.sql`, and the
  monthly corpus from `#59`)? The third **does not exist yet**: what is
  missing and what contract should it have?
- **Security and reproducibility**: the migration creates no `ROLE` and no
  `GRANT`; what does that mean for production? Is the migration reproducible
  on a clean database (`db:test` proves that)? Can `prisma migrate dev` lose
  the HNSW index or the triggers?

#### Track B — Backend (NestJS)

- **Response contract**: do `ApiError` and the global filter cover **every**
  non-2xx? What happens with unmapped Prisma errors, with Nest's own 404, with
  DTO validation errors? List the routes where the response can be
  inconsistent.
- **Pagination** (ADR-0022): check `limit`/`offset`, the bounds (50/200),
  stable ordering with `id` as tiebreaker, `X-Total-Count`, and that the
  total is computed **in the same query** (not with a separate `COUNT(*)` per
  page).
- **Session and RBAC** (ADR-0021): opaque token, SHA-256 stored in
  `platform.session`, immediate revocation, TTL, expiry, `bcrypt`, absence of
  user enumeration, and what happens when a user is suspended or expires
  **while a session is alive**. Can the permission guard be bypassed by a
  route without the decorator? Can `facility_id` leak between sessions?
- **Port/adapter pattern**: does the reference module (`config/families`)
  hold up? Does the service ever see Prisma? Is dependency injection by token
  with `useExisting` resolved correctly (repo rule 8: providers injected by
  constructor are imported **as values**, never with `import type`)? Look for
  any `import type` of a provider.
- **Modules**: everything else is missing (ingestion, rules, query, reports).
  Map what is missing against `docs/briefs/BRIEF-12-api-nestjs.md` and
  `BRIEF-45-pruebas-api.md`.
- **OpenAPI**: does the `docs/api/openapi.json` artifact actually describe
  what the API serves? Are DTOs documented with schema and example, or only
  the endpoints? Is comparing by content enough to catch a contract change?
- **Tests**: 36 API tests and 36 database specs. What is **not** tested and
  should be? Prioritize by risk, not by count.

#### Track C — AI implementations

- **The four engines** (`ocr`, `llm`, `embedding`, `scoring`): does each one
  honour its contract in `apps/api/src/ia/types.ts`? Is the structured output
  with a JSON Schema actually validated (IA.md §2), or only requested? Who
  validates it with Zod? Today the comment says "validation is the caller's
  job": does that caller exist?
- **Budget, cache and traceability** (`ia-runner.ts`, `budget.ts`, `cache.ts`,
  `trace.ts`): is the budget applied **before** spending? Does the cache key
  cover the right things (content hash + model + kind)? Are traces persisted
  anywhere or do they stay in memory?
- **Determinism**: do `IA_TEMPERATURE=0` and `IA_SEED=42` reach the
  provider? Is the evidence reproducible?
- **Embeddings**: the client **validates** 768 dimensions but **never asks
  for them** (`dimensions: 768` is not sent in the body). Confirm it and
  quantify the impact. The database design requires `vector(768)` with a
  cosine HNSW index.
- **Scoring** (SystemOne/Laya): `IA_SCORING_URL` (`localhost:8000/v1/systemone`)
  **does not answer**: the decision cascade is not executable. What does the
  system do when the engine is absent? Are the thresholds (`0.90` / `0.60`)
  applied in the right place (`ia/scoring.ts`)? Is the scoring verdict stored
  with its calibrated confidence and its model version?
- **Absences**: there is no BullMQ worker and no ingestion→OCR→LLM→embeddings
  pipeline. Which contracts in `docs/ingenieria/COLAS.md` and `IA.md` are
  left orphaned? What would it take to make the cascade runnable end to end?
- **RNF-03 (locality)**: a remote endpoint requires `IA_NUBE_ACTIVADA=true`.
  Is that validated at startup? And per call?

#### Track D — The rest of the system

- **Frontend** (`apps/web`): the app is not wired to the API yet. The
  `ApiClient` exists and the permission guards work, but **no feature view
  consumes it** — the views (`capture`, `inbox`, `schedule`, `search`) are
  static placeholders, and `auth.service.ts` holds a clearly marked demo
  session (`signInDemo()`) with `token: null`. The `/v1/quarantine`,
  `/v1/inbox`, `/v1/official-records` and `/v1/reports/day` paths appear only
  inside the specs of `api-client` and the interceptors. Assess: what is the
  cost of connecting the front to the real contract, and does the typed
  client + `ApiState` design hold up for it?
- **CI** (`.github/workflows/`): `ci.yml` has `guardas`, `diagramas` and
  `smoke`; `pr-issue.yml` has `enlace`; `sdd-tdd.yml` has `spec` and `tdd`;
  `project-sync.yml` syncs the GitHub Project. Is every job necessary? Does
  the `smoke` job really bring the infrastructure up? Does `gitleaks`, with
  `gitleaks.toml` and its documented `parserKey` exception, hide anything
  else? Is a job missing (an API↔database integration suite, for instance)?
- **Docs and traceability**: `docs/.indice` requires every `.md` to be listed
  (`bash scripts/doc-index.sh`). Do the architecture docs describe the
  present or the wish (rule 4 of `docs/README.md`)? Are there documents that
  no longer describe the code? Does `gestion/TRAZABILIDAD.md` reflect the
  real state of the issues?
- **Dataset and contract**: do the 6 families in `dataset/config1/esquemas`
  agree with the `family_config` seeded in `c1.sql`? With the rules? With
  the entity types? Does the frozen SHA still match?
- **Hygiene**: secrets in the repository, a committed `.env`, binaries or
  build artifacts under version control, unused dependencies, `console.log` in
  the boot path, open TODO/FIXME markers.

### 6. Method (mandatory)

1. **Reproduce, do not just read.** A finding without reproducible SQL or a
   command is an opinion, not a finding. For each one: the exact command and
   its output.
2. **Do not speculate.** If you could not verify it, it goes under "not
   verified", not under findings.
3. **Cite the evidence**: `path:line` for code, `schema.table.constraint` for
   the database, `file.md §section` for documents.
4. **Calibrate the severity**:
   - **blocker** — breaks, loses data, violates a repository rule or an ADR.
   - **important** — real debt or risk with a probable impact.
   - **minor** — style, clarity, maintainability.
5. **Do not propose a fix without a cause.** If something is correct, say so:
   the report also serves to close what is already fine.
6. **Respect the real state**: `#107` and `#120` are drafts, deliberately not
   merged, waiting for the database review. Other people's branches
   (`feat/11-*` from Kira, `feat/61-generador-dataset` from Carlos) are not
   to be touched. Do not recommend rewriting history.
7. **Language**: write the report in **Spanish** (the team reads it); leave
   identifiers, paths, commands and error messages in English.

### 7. Output contract

Deliver **one single markdown document** with exactly this structure:

```markdown
# Auditoría externa de DOCU — <date>

## Resumen ejecutivo
5-8 lines: what is solid, what is broken, what blocks the demo.

## Veredicto por carril
| Carril | Veredicto (sólido / con deuda / roto) | Bloqueantes | Importantes | Menores |

## Hallazgos
### [B-01] Título del hallazgo
- **Severidad**: blocker | important | minor
- **Carril**: A (BD) | B (backend) | C (IA) | D (resto)
- **Dónde**: `path:line` or `schema.table.constraint`
- **Qué pasa**: 2-4 sentences, no padding
- **Impacto**: what breaks and for whom
- **Evidencia**: command + output (trimmed to what proves it)
- **Causa**: why it happens (not just what)
- **Arreglo propuesto**: what to change, where, and which test would close it
- **Carril del repo**: the issue/brief/ADR it belongs to (#58, #12, #45, #46, #3, #85…)

## Lo que está bien (para no rehacerlo)
Short and concrete list, with the evidence that backs it.

## No verificado
What you could not check and why (no access, no engine, no data).

## Comandos ejecutados
Literal list, so another agent can reproduce your audit.

## Orden de ataque sugerido
Top 10 actions, each with: what it unblocks, effort (low/medium/high),
regression risk, and which PR it depends on.
```

Style rules: finding IDs are stable (`B-01`, `C-03`); no filler paragraphs; if
a track is clean, say it in one sentence; the whole report must fit in 4-8
screens.

**Before delivering**, check that every finding has a severity, reproducible
evidence and a proposed fix; that there are no unverified assertions; and
that the executive summary promises nothing the report does not support.

## PROMPT END

---

## Notes for whoever hands over the prompt (not part of the prompt)

- **Where the result lands**: ask for the report as a file
  (`docs/ingenieria/AUDITORIA-EXTERNA-<date>.md` is the natural home, but
  that file has to be added to `docs/.indice` or `bun run verify` fails on
  `scripts/doc-index.sh`).
- **What NOT to do**: do not commit or push the report without an explicit go
  ahead (repository rule 10). The report is evidence: it gets reviewed, then
  a decision is made.
- **If the external agent has no shell**: ask for the report in the chat and
  have it mark clearly what it could NOT verify. Track A (the database) is
  the part that loses the most without `psql`.
- **Session context**: the database design (`#58`) and the backend base
  (`#120`) are deliberately unmerged, waiting for the ER review. A report
  that says "merge this" without proposing the concrete change is useless.
