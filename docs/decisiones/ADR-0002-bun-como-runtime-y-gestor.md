# ADR 0002 — Bun como runtime y gestor de paquetes del monorepo

Fecha: 2026-10-05 · Estado: Aceptada · Decide: Erik · Revisa: cualquier
integrante del equipo

## Contexto

El monorepo tiene tres paquetes de código (`apps/api`, `apps/web` y a futuro
`packages/contracts`) que comparten TypeScript estricto, formato y hooks. El
equipo tenía que elegir un runtime único para no mantener la contradicción
Node/npm en un proyecto y Bun en el otro. Además, el CI levantaba el stack
completo (migración, seed, API, worker de prueba) en cada push y el tiempo de
instalación pesa.

## Decisión

**Bun 1.4.2** es el runtime, el gestor de paquetes, el ejecutor de scripts y el
orquestador del entorno local. Se fija con `packageManager: bun@1.4.2` en el
`package.json` raíz, y el CI lo instala con `oven-sh/setup-bun` fijando la misma
versión. Los scripts de paquete son los que la gente ejecuta; nadie debe
recordar `cd apps/api`.

Consecuencias directas:

- `bun run dev` es el único contrato de arranque; `bun run typecheck` corre
  todos los workspaces; `bunx biome` y `bunx prisma` son las herramientas de
  línea de comandos.
- El arranque local se orquesta desde TypeScript (`scripts/dev.ts`) y no desde
  un shell script, para que no dependa de `bash` y sirva en Windows, macOS y
  Linux con el mismo comando.
- Los hooks se ejecutan a través de `lefthook`, instalado por `postinstall`.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Node 24 LTS + npm | Funciona, pero duplica toolchain: hooks, scripts y el arranque local quedarían en Node mientras los tests en Bun. La divergencia cuesta más de lo que ahorra |
| pnpm workspaces | Buen gestor, pero no resuelve el runtime del worker de BullMQ ni el arranque en un comando |
| Deno | Runtime con TypeScript nativo, pero el ecosistema de NestJS y Prisma está menos probado en producción |

## Consecuencias

- **A favor**: una sola cadena de herramientas, arranque en un comando, `bunx`
  sin instalar nada global, CI con la versión exacta.
- **En contra**: `node_modules` y `bun.lock` los resuelve Bun. Si alguien abre
  el proyecto con npm o yarn, se generan árboles de dependencias distintos; por
  eso `bun.lock` es el único lockfile versionado.
- **A favor**: los procesos de Nest y BullMQ corren sobre el mismo runtime que
  ejecuta los tests, lo que elimina una clase de diferencias de comportamiento.
- **A contra** una advertencia honesta: el smoke de BullMQ ya confirma que
  BullMQ funciona sobre Bun, pero el worker de OCR con OCR real todavía no se ha
  ejercido; queda pendiente de evidencia en E2.

## Evidencia

- `package.json` raíz: `packageManager: bun@1.4.2`, scripts sin `npm`.
- `.github/workflows/ci.yml`: `oven-sh/setup-bun@v2` con `bun-version: 1.4.2`.
- `apps/api/scripts/queue-ping.ts` ejecutado por `bun` en el job `smoke` con
  resultado `queue-ping OK`.

## Qué nos haría revertirla

Perder soporte oficial de Bun para una dependencia de primer nivel, o que el
worker de OCR falle de forma sistemática por el runtime. En ese caso el
reemplazo natural es Node 24 LTS con Bun solo como gestor de paquetes, y eso
requeriría un ADR nuevo.