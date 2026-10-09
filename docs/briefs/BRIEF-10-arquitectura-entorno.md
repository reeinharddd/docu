# BRIEF #10 — Arquitectura, modelo de datos y entorno base

## 0. Encabezado

- Issue: #10
- Dueño: Erik
- Fechas: 2026-10-12 → **2026-10-23** · Sprint 1 · hito `Cierre de diseño` (2026-10-23)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Infraestructura / infraestructura
- Requisitos: RF-06, RNF-05, RNF-06 (bloquea M1; desbloquea #12, #3, #5, #7)
- Bloqueado por: nada · Bloquea a: #12 API, #3 Pipeline, #5 RBAC, #7 Configuración 1

Replanificación 2026-10-09: inicio 2026-10-05 → 2026-10-12 (+7 días).

## 1. Contexto

DOCU es un monolito modular (NestJS + worker BullMQ/Redis, PostgreSQL 18 + pgvector). Sin base técnica común, cada integrante inventa su entorno y nada es reproducible. Esta tarea deja el suelo: arquitectura en capas, modelo de datos y `docker compose up` con un comando.

## 2. Por qué importa tu parte

Es la raíz del grafo (`PLAN-EPICAS.md` dependencias): sin `pgvector` no hay `vector`, sin BD no hay ingesta. Si #10 se retrasa, Emmanuel (#7, #12) y el pipeline (#3) no arrancan y el contrato del 30-oct se congela en el aire. Si sale bien, todos levantan lo mismo en su laptop.

## 3. Objetivo y resultado esperado

Base técnica levantable con un comando y migración inicial aplicada.

| Entregable | Evidencia |
|---|---|
| Arquitectura en capas documentada | `docs/ingenieria/ARQUITECTURA.md` actualizado: app + worker + OCR en Compose |
| Modelo de datos inicial | `docs/ingenieria/MODELO-DATOS.md` + migración Prisma aplicada: `archivo_original`, dato oficial, historial, bitácora solo-INSERT, catálogos, tablas de configuración |
| Entorno reproducible | `docker compose up` limpio en laptop del equipo; `infra/docker-compose.yml` con PostgreSQL 18 + pgvector, Redis 8, app, worker |
| CI con pruebas por PR | Workflow corriendo `verify` por PR; `.env` fuera del repo (`.env.example` documenta cada variable) |
| Revisión de un par | PR aprobado con capturas de `compose up` + `/health ok` |

## 4. Actividades específicas

1. Fijar arquitectura (4 h): capas, qué corre en API vs worker (OCR nunca en API, ADR-0011), puertos y volúmenes. Terminado: `ARQUITECTURA.md` §3 coherente con `STACK.md`.
2. Modelar datos (6 h): entidades, `vector`, solo-INSERT (ADR-0010), reglas como datos (ADR-0009). Terminado: migración inicial `prisma migrate` en verde.
3. Componer entorno (4 h): `infra/docker-compose.yml` + `scripts/dev.sh` como única entrada. Terminado: `compose config` + `compose up` limpio.
4. Cerrar CI (2 h): `verify` = lint + typecheck + tests web + `smoke-api.sh` (`/health` por condición, no `sleep` fijo). Terminado: PR verde.
5. Probar en otra máquina o rama limpia (1 h): `bash scripts/setup.sh` desde cero. Terminado: un par confirma que levanta.

Total estimado: 15–18 h.

## 5. Entradas y salidas

- Recibe: ADRs 0002/0004/0005/0009/0010/0011, `ingenieria/STACK.md`, `CASO.md` (familias y reglas R-P1..T1).
- Entrega: a Emmanuel (#7, #12) y al pipeline (#3), por PR, entorno + migración + docs. Avisa en #3 y #7 cuando mergee.

## 6. Referencias y caja de herramientas

Repo (leer primero): `ingenieria/ARQUITECTURA.md`, `MODELO-DATOS.md`, `ENTORNO.md`,
`STACK.md`, `operacion/BOOTSTRAP.md`; ADR-0002 (Bun), ADR-0004 (Prisma + pgvector),
ADR-0005 (BullMQ), ADR-0009/0010/0011.

Recursos oficiales para implementar (no tutoriales de agregador):

| Para | Recurso | Cuándo usarlo |
|---|---|---|
| API NestJS | https://docs.nestjs.com (guards, DI, `emitDecoratorMetadata`) | Al cablear providers y guards de #10 |
| Prisma + driver adapters | https://www.prisma.io/docs (migraciones, `prisma.config.ts`) | Al crear la migración inicial |
| PostgreSQL 18 | https://www.postgresql.org/docs/18/ | Al fijar tipos y extensiones |
| pgvector | https://github.com/pgvector/pgvector (columna `vector`, índices) | Al modelar el campo vectorial |
| BullMQ 6 + Redis 8 | https://docs.bullmq.io + https://redis.io/docs | Al separar API vs worker (ADR-0011) |
| Docker Compose | https://docs.docker.com/compose/ (healthcheck por condición) | Al escribir `infra/docker-compose.yml` |
| Bun 1.4.2 | https://bun.com/docs | Al fijar scripts y shebangs |

Comandos del repo: `bun run verify`, `bun run doctor`, `bash scripts/doc-index.sh`.

Curaduría del equipo: https://devdocs.io (docs offline de TS/Docker) al escribir Compose y migraciones; https://postgres.new al validar el modelo sin levantar local; https://hadolint.github.io (lint de Dockerfiles, opcional) si se agrega imagen propia.

## 7. Cómo trabajar

- `/tarea 10` y `/cerrar` en OpenCode; rama `feat/10-<slug>` desde `main`.
- Nada de lógica de negocio (E1 = solo configs, regla 6). Solo capas, esquema y entorno.
- En `apps/api`, ningún provider inyectado por constructor se importa con `import type` (incidente `health.controller.ts` + `emitDecoratorMetadata`).
- TypeScript estricto, sin `any` sin justificación. `.env` nunca al repo.
- Bloqueo >24 h: etiqueta `bloqueado` y escala el mismo día.

## 8. Criterios de aceptación

- [ ] `docker compose up` limpio y `/health` responde `ok` (smoke por condición).
- [ ] Migración inicial aplicada; `prisma validate` en verde.
- [ ] `ARQUITECTURA.md` y `MODELO-DATOS.md` describen lo que hay, no el deseo.
- [ ] `bun run verify` y `doctor` en verde en la rama.
- [ ] Un par revisó y aprobó con evidencia adjunta.

No es done si: levanta solo en una máquina; la migración se aplicó a mano sin archivo; hay lógica de negocio en `apps/`.

## 9. Riesgos nombrados

`pgvector` o Redis rompen el `up` en otra laptop. Mitigación: probar desde `setup.sh` limpio; desde el 2026-10-19 sin `up` reproducible es bloqueo (frena #7 y #12).

## 10. Revisión

Viernes 2026-10-23 en el sync, con Emmanuel (su #7 depende de esto). Después: #12 y #3 arrancan.
