# AGENTS.md — DOCU app (raíz del monorepo)

## Proyecto
DOCU — Repositorio de Documentación Digital. Config 1: Baja SterilPack.
Monorepo bun: `apps/api` (NestJS 12 + Prisma 7 + BullMQ 6), `apps/web`
(Angular 22 zoneless + Tailwind 4), `packages/*`, `infra/`, `dataset/`.
Docs académicos y briefs: repo hermano `../9c/docu` (`docs/briefs/`).

## Comandos (bun, nada de npm)
- Instalar todo: `bun install` (raíz)
- Tipos: `bun run typecheck` (raíz, corre todos los workspaces)
- Lint/formato: `bunx biome check .` (escribir: `--write`)
- API: `bun --env-file ../../.env src/main.ts` desde `apps/api`
- Migraciones: `bunx prisma migrate dev` desde `apps/api` (lee `../../.env`)
- Web dev/build: `bun run start` / `bun run build` desde `apps/web`

## Reglas duras (todo agente y humano las obedece)
1. `.env` y secretos JAMAS al repo. `.env.example` documenta cada variable.
2. Commits convencionales, sin atribucion a AI.
3. Espanol en docs, ingles en codigo/config.
4. TypeScript estricto en ambos proyectos. Nada de any sin justificacion escrita.
5. `originales/` es solo lectura; nada se borra en silencio.
6. E1 es solo configs: sin logica de negocio hasta M1/K1/C1.
7. Drive y Docs en solo lectura en vivo. Monday solo con peticion explicita.
8. Antes de cerrar algo: tipos y lint en verde mas evidencia. Un cambio por commit.
9. Nada destructivo sin orden explicita. Main protegida, todo por PR con revisor.
