# Ingeniería: entorno

Estado: vigente. Detalle de arranque: `docs/operacion/BOOTSTRAP.md`.

## Servicios de datos

Definidos en `infra/docker-compose.yml`, proyecto `docu`:

| Servicio | Imagen | Puerto | Volumen |
|---|---|---|---|
| `docu-db` | `pgvector/pgvector:pg18` | `${PG_PORT:-5432}` | `docu_pgdata` |
| `docu-redis` | `redis:8` | `${REDIS_PORT:-6379}` | `docu_redisdata` |

Ambos con `restart: unless-stopped` y healthcheck. Postgres usa `pg_isready`,
Redis usa `redis-cli ping`. `infra/postgres/init` se monta como
`docker-entrypoint-initdb.d` y está **vacío**: la extensión `vector` la crea la
migración de Prisma, no un script de arranque.

Tags flotantes, sin digest. `pg18` y `8` son ramas móviles. Es aceptable para
desarrollo y es un punto a fijar antes de cualquier despliegue compartido.

## Servicios de aplicación

| Servicio | Cuándo | Nota |
|---|---|---|
| `api` | M1 | Mismo build que hoy, puerto `PORT_API` |
| `worker` | E2 | Misma imagen, comando worker |

Hoy no están en el Compose: se levantan con `bun run dev` en primer plano.
Cuando lleguen, deben declarar `depends_on` con `condition: service_healthy`, no
con `service_started`.

## Variables

14 en `.env`. Los nombres están en `.env.example`, que es la documentación de
cada una; los valores viven solo en la máquina. La política completa, incluidos
los permisos de Monday y Drive, está en `docs/integraciones/`.

| Grupo | Variables |
|---|---|
| Datos | `DATABASE_URL`, `PG_PORT`, `REDIS_URL`, `REDIS_PORT` |
| API | `PORT_API`, `JWT_SECRET` |
| Monday | `MONDAY_API_KEY`, `MONDAY_BOARD_ID` |
| Drive | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_DRIVE_FOLDER` |
| IA | `IA_LOCAL_ACTIVADA`, `IA_NUBE_ACTIVADA` |
| Memoria | `ENGRAM_PROYECTO` |

La API se lanza con `bun --env-file ../../.env`, y `prisma.config.ts` carga el
mismo archivo. No hace falta exportar nada a mano.

## Entornos

| Entorno | Qué lo define | Estado |
|---|---|---|
| Local | Compose con tags flotantes | Operativo |
| Devcontainer | `.devcontainer/devcontainer.json`, Bun 1.4.2, `postCreateCommand: bun install` | Operativo |
| CI | `.github/workflows/ci.yml`, Bun 1.4.2, PostgreSQL y Redis como servicios | Operativo |

En CI la URL de la base apunta a `localhost:5432` porque Postgres corre como
servicio del job. Es el mismo schema, otro host.

## Puertas

`bun run verify` encadena lint, tipos, `prisma validate`, `compose config`,
honestidad del índice documental y pruebas web. CI corre los mismos comandos con
las mismas versiones fijadas, así que local y remoto no pueden divergir.

| Puerta | Comando | Estado |
|---|---|---|
| Lint | `bun run lint` | Verde. Biome `2.5.4` con `recommended` y `--error-on-warnings` |
| Tipos | `bun run typecheck` | Verde en `apps/api` y `apps/web` |
| Schema | `bun run prisma:validate` | Verde |
| Compose | `bun run compose:check` | Verde |
| Índice documental | `bash scripts/doc-index.sh` | Verde |
| Pruebas web | `bun --filter web test` | Verde: 1 archivo, 2 pruebas |
| Pruebas api | — | **No existe. 0 archivos** |
| Secretos | Gitleaks + hook | Verde |
