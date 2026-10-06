# DOCU — Repositorio de Documentación Digital

Plataforma para centralizar la información dispersa de una empresa en un
solo lugar confiable. Configuración 1: planta de empaque médico
(Baja SterilPack). Equipo 9C, Desarrollo Web Integral.

Stack: Bun + Angular 22 (zoneless, signals) + NestJS 12 + Prisma 7 +
PostgreSQL 18 + pgvector + Redis 8 + BullMQ 6. TypeScript estricto en
punta a punta. Lint: Biome (+ angular-eslint en templates).

## Arranque (E1)

Un solo comando. Crea `.env` si falta, valida, levanta PostgreSQL + pgvector +
Redis, aplica migraciones, siembra y arranca API y web:

```
bun install
bun run doctor     # valida entorno y dice qué falta, sin fallar
bun run dev        # compose + prisma migrate deploy + seed + api + web
```

Diagnóstico y puertas de calidad:

```
bun run verify     # lint + tipos + prisma validate + compose config + pruebas web
```

Puertos: web `4200`, API `3000`. `GET /health` debe responder `ok` con pg+redis.

## Estructura

- `apps/api` — NestJS modular (M1/M2, Emmanuel).
- `apps/web` — Angular zoneless + Tailwind (K1/K2, Kira).
- `infra/` — Docker Compose + config (E1, Erik).
- `dataset/` — datos sintéticos + ground truth (C1, Carlos).
- `docs/` — sistema documental (ver `docs/README.md`).
- `scripts/` — `dev.sh` (arranque) y `doctor.sh` (diagnóstico).

## Reglas

Ver `docs/REGLAS.md` y `AGENTS.md`. Sin evidencia no hay "ya quedó".

## Seguridad

Ver [SECURITY.md](SECURITY.md). Reportes por issue privado con etiqueta seguridad.
