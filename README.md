# DOCU — Repositorio de Documentación Digital

[![ci](https://github.com/reeinharddd/docu/actions/workflows/ci.yml/badge.svg)](https://github.com/reeinharddd/docu/actions/workflows/ci.yml)

Plataforma para que la información dispersa de una empresa (Excel, correos,
escaneados, sistemas de las plantas hermanas) sea **confiable, trazable y
decidible**: DOCU propone, la persona confirma, y cada cifra cita su fuente.

**Configuración 1**: planta de empaque médico flexible **Baja SterilPack**
(caso sintético, el "rollo fantasma"). Equipo 9C, Desarrollo Web Integral.

> Estado actual (2026-11-03): E1 (repositorio, CI, docs) cerrado. C1
> (caso completo, con la IA dentro) en marcha: ni la BD ni el frontend ni el
> backend están construidos todavía. Las fechas que mandan son **2026-11-24
> (demo con el profesor Yakko)** y **2026-12-03 (presentación final)**.

## Qué es DOCU

- Ingiere fuentes heterogéneas con el original intacto y su `sha256`.
- Valida en cadena declarativa: las reglas del caso son **datos**
  (`ReglaValidacion`), no código.
- Cuarentena con motivo; nada se borra en silencio.
- Dato oficial con historial de origen, regla aplicada y quién confirmó.
- La IA **propone** (clasificación, extracción, embeddings); la persona
  **dispone**. Sin confirmación humana no hay dato oficial (ADR-0006).

## Stack

Bun 1.4.3 · Angular 22 (zoneless, signals) · NestJS 12 · Prisma 7 · PostgreSQL
18 + pgvector · Redis 8 · BullMQ 6 · TypeScript estricto · Biome 2.5.4
(lista verificada en `docs/ingenieria/STACK.md` y en el lockfile).

## Arranque

```bash
git clone git@github.com:reeinharddd/docu.git && cd docu
bash scripts/setup.sh     # instala y verifica el entorno (idempotente)
bun install
bun run doctor            # dice qué falta, sin tocar nada
bun run dev               # Postgres + pgvector + Redis en Docker, luego la API
bun run dev:web           # Angular en http://localhost:4200 (aparte)
bun run verify            # puertas de calidad: lint, tipos, CI checks, índice, pruebas web, smoke de la API
```

`GET /health` responde `{ status, postgres, redis }`. Puertos: web `4200`,
API `3000`. Detalle y Windows/WSL2: `docs/operacion/BOOTSTRAP.md`.

## Estructura

- `apps/api` — NestJS (E1: solo `/health`; el dominio llega en C1).
- `apps/web` — Angular zoneless + Tailwind (esqueleto; pantallas en C1).
- `infra/` — Docker Compose de datos (`db` pgvector/pgvector:pg18, `redis:8`).
- `dataset/` — datos sintéticos de C1 (solo `esquemas/` se versiona; el
  dataset generado no).
- `docs/` — el sistema documental (`docs/README.md`), con índice verificado.
- `scripts/` — setup, doctor, verify, gates de docs y harness.
- `.opencode/` — comandos y skills del agente, compartidas por el equipo.

## Equipo y operación

| Persona | Rol |
|---|---|
| Erik (`reeinharddd`) | Líder, caso, plataforma frontend, IA, BD |
| Emmanuel (`Agent3835`) | Backend |
| Kira (`kirxllix`) | Frontend y UX |
| Carlos (`WearyBerry`) | Dataset y QA |

Trabajo por GitHub Issues + Project (`docs/integraciones/GITHUB-GESTION.md`);
un issue `En progreso` por persona; PR con `Closes #N`; sin evidencia no hay
"ya quedó" (`docs/REGLAS.md`).

## Documentación

Empieza por `docs/README.md` (la ley del sistema documental) y
`docs/HARNESS.md` (cómo trabajamos). Decisiones: `docs/decisiones/`. Caso y
requisitos: `docs/proyecto/`. Arranque y diagnóstico:
`docs/operacion/BOOTSTRAP.md`.

## Seguridad

Ver [SECURITY.md](SECURITY.md): reportes en issue con etiqueta `seguridad`,
solo al líder. `.env` jamás al repo; CI falla si aparece.
