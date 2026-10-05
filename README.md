# DOCU — Repositorio de Documentación Digital

Plataforma para centralizar la información dispersa de una empresa en un
solo lugar confiable. Configuración 1: planta de empaque médico
(Baja SterilPack). Equipo 9C, Desarrollo Web Integral.

Stack: Bun + Angular 22 (zoneless, signals) + NestJS 12 + Prisma 7 +
PostgreSQL 18 + pgvector + Redis 8 + BullMQ 6. TypeScript estricto en
punta a punta. Lint: Biome (+ angular-eslint en templates).

## Arranque (E1)

1. `bun install`
2. Copia `.env.example` a `.env` y ajusta `JWT_SECRET`
   (si los puertos 5432/6379 están ocupados, cambia `PG_PORT`/`REDIS_PORT`).
3. `docker compose -f infra/docker-compose.yml --env-file .env up -d`
4. `bun run --filter @docu/api db:migrate && bun run --filter @docu/api db:seed`
5. `bun run --filter @docu/api start` → `GET /health` debe dar `ok` con pg+redis.

## Estructura

- `apps/api` — NestJS modular (M1/M2, Emmanuel).
- `apps/web` — Angular zoneless + Tailwind (K1/K2, Kira).
- `packages/contracts` — contratos API compartidos (DTOs, OpenAPI).
- `infra/` — Docker Compose + config (E1, Erik).
- `dataset/` — datos sintéticos + ground truth (C1, Carlos).

## Reglas

Ver `docs/REGLAS.md`. Sin evidencia no hay "ya quedó".

## Seguridad

Ver [SECURITY.md](SECURITY.md). Reportes por issue privado con etiqueta seguridad.
