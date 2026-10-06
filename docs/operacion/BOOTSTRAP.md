# Operación: arranque y resonancia

Estado: vigente. Verificado el 2026-10-05.
Este archivo reemplaza las instrucciones de arranque del `README.md`.

## Requisito previo

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
declaradas, Docker, los tres gates ejecutables, la honestidad del índice
documental y el estado del árbol de Git.

## Puertas de calidad

```
bun run verify
```

Encadena, en orden: `lint` → `typecheck` → `prisma:validate` →
`compose:check` → pruebas web. Es el mismo criterio que CI, con los mismos
comandos, para que local y remoto no discrepen.

| Puerta | Qué es |
|---|---|
| `bun run lint` | Biome con `recommended`. `--error-on-warnings`: un aviso es fallo |
| `bun run typecheck` | TypeScript estricto en `apps/api` y `apps/web` |
| `bun run prisma:validate` | El schema es válido |
| `bun run compose:check` | El Compose es válido |
| pruebas web | Vitest |

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
| `.env` no existe | Primer arranque | `cp .env.example .env`, ajusta `JWT_SECRET` |
| `FALTA` en las variables de Monday o Drive | Credencial no entregada | Pídela al líder. No la busques en el repo |
| Puerto ocupado | Otro proceso | Cambia `PG_PORT` / `REDIS_PORT` / `PORT_API` en `.env` |
| `prisma migrate deploy` falla | Compose no está arriba | `docker compose -f infra/docker-compose.yml --env-file .env up -d --wait` |
| La API no responde en `/health` | Falta Redis o la BD | Revisa los logs de `bun run dev` |
| Monday devuelve un tablero vacío | Se pidió `total_count` o `items_page_items` | Ver `integraciones/MONDAY.md` |
| Drive devuelve una carpeta vacía | `fields` sin el envoltorio `files(...)`, o HTTP 400 no chequeado | Ver `integraciones/DRIVE.md` |
