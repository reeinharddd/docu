# AGENTS.md — DOCU app (repo root)

## Project
DOCU — Repositorio de Documentación Digital. Config 1: Baja SterilPack.
Bun monorepo: `apps/api` (NestJS 12 + Prisma 7 + BullMQ 6), `apps/web`
(Angular 22 zoneless + Tailwind 4), `infra/`, `dataset/`. `packages/` does not
exist yet; if it is created, it must be registered in `workspaces`.
Project documents: start with `docs/README.md` and the harness map in
`docs/HARNESS.md`. Task briefs: `docs/briefs/`. Decisions:
`docs/decisiones/`. Startup and diagnosis: `docs/operacion/BOOTSTRAP.md`.
Stack and versions: `docs/ingenieria/STACK.md`.

## Commands (bun, never npm)
- Install everything: `bun install` (root)
- Types: `bun run typecheck` (root, runs all workspaces)
- Lint/format: `bun run lint` (write: `bun run lint:fix`). Biome is pinned as a
  dependency, never use `bunx biome`: `bunx` pulls the latest version from the
  registry and lint would stop being reproducible
- Everything: `bun run verify`. Diagnosis: `bun run doctor`
- API: `bun --env-file ../../.env src/main.ts` from `apps/api`
- Migrations (when Prisma exists, in M1/C1): `bunx prisma migrate dev` from `apps/api` (reads `../../.env`)
- Web dev/build: `bun run start` / `bun run build` from `apps/web`

## Language rules (non-negotiable)
- Agent-consumed content in English: `AGENTS.md`, `CLAUDE.md`, `.opencode/`,
  agent prompts, skills and commands. English imperatives, current best
  practices: role, constraints, output contract. Unknown frontmatter keys
  are routed into `options` and sent to the model API — only documented
  fields; project metadata lives in `<!-- -->` blocks right after the
  frontmatter (`owner`, `trigger`, `purpose`).
- Human-consumed content in Spanish: `docs/`, README, briefs, ADRs, templates
  for people. English only in code, config and scripts.
- Machine-read metadata keys use English (`owner`, `trigger`, `purpose`).

## Hard rules (every agent and human obeys)
1. `.env` and secrets NEVER go to the repo. `.env.example` documents every variable.
2. Conventional commits, no AI attribution.
3. Spanish in docs, English in code/config. Agent-facing files in English.
4. Strict TypeScript in both projects. No `any` without written justification.
5. `originales/` is read-only; nothing is deleted silently.
6. E1 is config-only: no business logic until M1/K1/C1.
7. Drive and Docs are live read-only. Work management lives in GitHub Issues:
   reading is free, writing per `docs/integraciones/GITHUB-GESTION.md`.
8. Before closing anything: green `bun run verify` plus evidence. One change
   per commit. The API has 0 tests: `verify` starts it and queries `/health`
   because there is no other net to catch it. In `apps/api`, no provider
   injected by constructor is imported with `import type`: NestJS resolves it
   with `emitDecoratorMetadata` and needs the class at runtime.
9. Nothing destructive without an explicit order. `main` is protected, everything via PR with a reviewer.
10. No commit and no push without the user's prior verification: after each
    change, review everything with the user, and only with their explicit
    satisfaction ask whether to commit; the same for push. Without that yes,
    there is no commit and no push.
