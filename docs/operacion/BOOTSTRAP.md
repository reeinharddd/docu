# Operación: arranque y diagnóstico

Estado: vigente. Verificado el 2026-10-09: clon limpio + `cp .env.example .env`
+ `bun install --frozen-lockfile` + `prisma generate` deja `typecheck`, `lint`,
`compose:check` e índice documental en verde. `smoke:api` exige `bun run dev`
con Docker arriba; sin infra es fallo esperado, no defecto del repo.
Este archivo reemplaza las instrucciones de arranque del `README.md`.

## Primera vez: un solo comando

```
git clone git@github.com:reeinharddd/docu.git && cd docu
bash scripts/setup.sh
```

`scripts/setup.sh` es idempotente y no usa `sudo`. Instala lo que falte en el
home del usuario y deja todo verificado:

| Paso | Qué hace |
|---|---|
| Sistema | Linux, macOS o Windows con WSL2. Exige `git`, `curl`, `unzip` |
| Git | Pide nombre y correo si faltan |
| Bun | Instala la versión exacta de `packageManager` en `~/.bun` |
| GitHub CLI | Instala `gh` en `~/.local/bin`, inicia sesión con el navegador y pide el scope `project` |
| OpenCode | Instala `opencode` en `~/.opencode` |
| Docker | Solo comprueba. En E1 únicamente lo usa el smoke de `verify` |
| Dependencias | `bun install --frozen-lockfile` y hooks de lefthook |
| `.env` | Lo crea desde `.env.example` si no existe |
| PATH | Agrega las rutas al `.bashrc` o `.zshrc` |
| Diagnóstico | Corre `bun run doctor` |

**Windows**: instala WSL2 (`wsl --install` en PowerShell como administrador),
abre la terminal de Ubuntu y clona el repositorio **dentro** de WSL, no en
`C:\`. Docker Desktop con integración WSL activada.

## Trabajar con OpenCode

El repositorio trae todo lo que el agente necesita; no hay configuración
personal que copiar:

| Pieza | Archivo |
|---|---|
| Contrato e instrucciones | `AGENTS.md`, `docs/REGLAS.md`, `docs/decisiones/README.md` (cargados por `opencode.json`) |
| Configuración única | `opencode.json` de la raíz: instructions, permisos, plugin superpowers y MCP (Engram, Drive, extras apagados). Es la única config; `.opencode/opencode.jsonc` es legacy local que opencode no lee (`bun run doctor` avisa) |
| Permisos | `opencode.json`: lectura libre, escrituras con confirmación, destructivos denegados |
| Comandos del equipo | `.opencode/commands/` |
| Skills del proyecto | `.opencode/skills/` |
| Memoria | MCP Engram desde el repo (`opencode.json`: `--tools=agent --project=docu`, pisa tu entrada global). Requiere: binario `engram` en el PATH (lo comprueba `setup.sh`) y `ENGRAM_PROJECT=docu` en `.env`. Uso operativo: skill `docu-memoria`. Indexa, no reemplaza: `docs/integraciones/ENGRAM.md` |
| Drive lectura | MCP `drive` desde el repo (`opencode.json`, solo lectura). OAuth del líder (`.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`). Solo leer y exportar; prohibido crear, subir o borrar: `docs/integraciones/DRIVE.md`. Prueba: `bash scripts/drive-check.sh` |
| GitHub | `gh` instalado y autenticado por `setup.sh` (scope `project`). Permisos por comando en `opencode.json`. Gestión en `docs/integraciones/GITHUB-GESTION.md` |
| Capacidades futuras | Angular CLI, PostgreSQL, Redis, Playwright y Firecrawl ya delimitados y apagados (`enabled false`, cero costo). Opt-in por tarea en tu config global o cambio local sin commitear. Redis exige `uvx`, Playwright exige navegadores (`npx playwright install chromium`), postgres/firecrawl leen `{env:...}` del shell que lanza opencode (exportar `.env` antes). Disparadores en `docs/integraciones/MCP.md`; nada se commitea encendido antes de su disparador |

La primera vez, dentro de `opencode`: `/connect` para elegir el proveedor de
modelos. Proveedor base del equipo: **OpenCode Zen, capa gratis**. Cada máquina
conecta su propia cuenta Zen (`/connect` → Zen); la key vive en tu auth local,
nunca en el repo. Eliges modelos con `/models`: toma los `*-free` vigentes
(rotan; no se pinean IDs sin probar). Cadena de fallback: principal gratis
capaz → `small_model` gratis rápido (subagentes lo heredan) → tu modelo de
pago en config personal si lo necesitas. Si un free deja de rendir, se cambia
en el acto y se avisa al equipo. Si vas a activar un extra que usa `{env:...}` (postgres, firecrawl),
lanza opencode con el entorno exportado: `set -a; source .env; set +a`. Después:

| Comando | Para qué |
|---|---|
| `/inicio` | Quién eres en el equipo, tus tareas, reglas y siguiente paso |
| `/estado` | Estado del proyecto: PR, hitos, bloqueos, huecos |
| `/tarea N` | Empezar el issue N: contexto, dependencias, rama y plan |
| `/cerrar` | `verify`, commit convencional y PR con `Closes #N` |
| `/brief N` | Redactar el brief de delegación del issue N |
| `/adr <decisión>` | Proponer una ADR con la plantilla |

## Requisito previo (instalación manual)

| Herramienta | Versión | Verificación |
|---|---|---|
| Bun | `1.4.2` exacta | `package.json` → `packageManager`, fijada en CI y devcontainer |
| Docker | con Compose v2 | `docker --version` |
| Git | cualquiera | — |

Bun es el único gestor de paquetes del proyecto (`docs/decisiones/ADR-0002`).
`npm`, `pnpm` y `yarn` no son compatibles: `bun.lock` es el lockfile.

## Arranque

```
bun install
bun run doctor
bun run dev
```

`bun run dev` es el único comando de arranque y hace todo, en orden, de forma
idempotente:

1. Copia `.env.example` a `.env` si no existe.
2. Levanta PostgreSQL 18 + pgvector y Redis 8 con `--wait`.
3. `prisma generate` y `prisma migrate deploy`.
4. Siembra la base con `prisma/seed.ts`.
5. Arranca la API y se queda en primer plano.

La web se levanta aparte:

```
bun run dev:web
```

| Servicio | URL | Puerto |
|---|---|---|
| API | `http://localhost:3000` | `PORT_API` |
| Web | `http://localhost:4200` | — |
| PostgreSQL | `localhost:5432` | `PG_PORT` |
| Redis | `localhost:6379` | `REDIS_PORT` |

Health check: `GET /health` debe responder `ok` con pg y redis conectados.

## Diagnóstico

`bun run doctor` es de solo lectura, no arregla nada y nunca sale con error.
Reporta `OK` / `FALTA` / `AVISO` por pieza y cierra con el resumen. Si marca
`FALTA`, el entorno no es operable: corrige antes de escribir código.

Lo que comprueba: versión de Bun contra `packageManager`, versión local de
Biome contra el `$schema` de `biome.json`, Prisma generado, `.env` y variables
declaradas, Docker, los gates ejecutables, la honestidad del índice documental
y el estado del árbol de Git.

## Puertas de calidad

```
bun run verify
```

Encadena, en orden: `lint` → `typecheck` → `prisma:validate` →
`compose:check` → índice documental → pruebas web → `smoke:api`. Es el mismo
criterio que CI, con los mismos comandos, para que local y remoto no discrepen.

| Puerta | Qué es |
|---|---|
| `bun run lint` | Biome con `recommended`. `--error-on-warnings`: un aviso es fallo |
| `bun run typecheck` | TypeScript estricto en `apps/api` y `apps/web` |
| `bun run prisma:validate` | El schema es válido |
| `bun run compose:check` | El Compose es válido |
| índice documental | `bash scripts/doc-index.sh` |
| pruebas web | Vitest |
| `bun run smoke:api` | La API arranca y `/health` responde `ok` |

Un cambio se cierra con `verify` en verde más la evidencia del PR. Sin las dos
cosas no hay "ya quedó" (`docs/REGLAS.md`).

## Entornos

| Entorno | Para qué | Estado |
|---|---|---|
| Local | Desarrollo diario. Postgres y Redis en Docker | Operativo |
| Devcontainer | Editor sin herramientas del host | Operativo. `postCreateCommand` = `bun install` |
| GitHub Actions | Puerta automática | Operativo, 2 trabajos: `guardas` y `smoke` |

## Cuando algo se rompe

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `bun run lint` dice que Biome no coincide con el schema | `node_modules` de otra máquina | `bun install` |
| `.env` no existe | Primer arranque | `bun run setup` |
| `gh` sin sesión o sin scope `project` | Token viejo | `gh auth refresh -s project` |
| `opencode` o `bun` no se encuentran | Terminal abierta antes del setup | Abre una terminal nueva |
| `FALTA` en las variables de Drive | Credencial no entregada | Pídela al líder. No la busques en el repo |
| Puerto ocupado | Otro proceso | Cambia `PG_PORT` / `REDIS_PORT` / `PORT_API` en `.env` |
| `typecheck` falla con `no exported member 'PrismaClient'` en clon limpio | Falta `prisma generate` | `cd apps/api && bunx prisma generate` (lo hace `setup.sh` y `bun run dev`) |
| `prisma migrate deploy` falla | Compose no está arriba | `docker compose -f infra/docker-compose.yml --env-file .env up -d --wait` |
| La API no responde en `/health` | Falta Redis o la BD | Revisa los logs de `bun run dev` |
| Drive devuelve una carpeta vacía | `fields` sin el envoltorio `files(...)`, o HTTP 400 no chequeado | Ver `integraciones/DRIVE.md` |
