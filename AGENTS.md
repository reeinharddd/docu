# AGENTS.md — DOCU app (raíz del monorepo)

## Proyecto
DOCU — Repositorio de Documentación Digital. Config 1: Baja SterilPack.
Monorepo bun: `apps/api` (NestJS 12 + Prisma 7 + BullMQ 6), `apps/web`
(Angular 22 zoneless + Tailwind 4), `infra/`, `dataset/`. `packages/` no existe
todavia; si se crea, hay que registrarlo en `workspaces`.
Documentos del proyecto: empieza por `docs/README.md` y el mapa del harness
`docs/HARNESS.md`. Briefs de tarea:
`docs/briefs/`. Decisiones: `docs/decisiones/`. Arranque y diagnóstico:
`docs/operacion/BOOTSTRAP.md`. Stack y versiones: `docs/ingenieria/STACK.md`.

## Comandos (bun, nada de npm)
- Instalar todo: `bun install` (raíz)
- Tipos: `bun run typecheck` (raíz, corre todos los workspaces)
- Lint/formato: `bun run lint` (escribir: `bun run lint:fix`). Biome esta
  fijado como dependencia, nunca uses `bunx biome`: `bunx` trae la ultima
  version del registro y el lint dejaria de ser reproducible
- Todo junto: `bun run verify`. Diagnostico: `bun run doctor`
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
7. Drive y Docs en solo lectura en vivo. Gestion en GitHub Issues: leer libre,
   escribir segun `docs/integraciones/GITHUB-GESTION.md`.
8. Antes de cerrar algo: `bun run verify` en verde mas evidencia. Un cambio por commit.
   La API tiene 0 pruebas: `verify` la arranca y consulta `/health` porque no
   hay otra red que tire. En `apps/api`, ningun provider inyectado por
   constructor se importa con `import type`: NestJS lo resuelve con
   `emitDecoratorMetadata` y necesita la clase en runtime.
9. Nada destructivo sin orden explicita. Main protegida, todo por PR con revisor.
10. Nada de commit ni push sin verificacion previa del usuario: tras cada
    cambio se revisa todo con el usuario y solo con su satisfaccion
    explicita se pregunta si commitear; lo mismo para push. Sin ese si,
    no hay commit ni push.
