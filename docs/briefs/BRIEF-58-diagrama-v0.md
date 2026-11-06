# BRIEF #58 — ER v1 de C1: draw.io fuente + texto derivado, DDL, vistas, triggers y migración

## 0. Encabezado

- Issue: #58
- Dueño: Emmanuel Valenzuela Cruz (`Agent3835`); Erik (`reeinharddd`) apoya y revisa.
- Fechas: 2026-11-02 → 2026-11-10 · Sprint 2 → 3 · hito `C1 modelo y BD` (12-nov)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Base de datos / base de datos.
- Requisitos: RF-08
- Bloqueado por: #83 (caso, **cerrado** el 3-nov con PR #101) · Bloquea a: #59, #60, #62, #44, #5, #61, #85
- Nota (2026-10-18): ADR-0016 cambió el entregable de "DBML + PNG" a **Mermaid**.
- Nota (2026-10-19): ADR-0017 pasó el ER a **draw.io** (`.drawio` + SVG exportado
  por página, `ingenieria/DIAGRAMAS.md`); Mermaid queda para flujos y secuencias.

## 1. Contexto

**Punto de partida (2026-11-05):** el borrador v0 está en `main`
(`docs/ingenieria/DIAGRAMA-BD-v0.drawio` + texto derivado, ADR-0017, PR #99) y el
vocabulario canónico en inglés vive en el mapa de derivación de `CASO.md`
(#83 cerrado). Eso es la **Fase 1** (área `core`: 10 tablas, 2 páginas, SHA-256
verde en `bun run diagramas:check`). Lo que falta es el resto: **5 de las 6
fases**, el **DDL**, las **vistas**, los **triggers**, la **migración aplicada**
y el **ADR-0019** que afirma el modelo híbrido.

Despliegue: una compañía corre su propio sistema; en él conviven sus instalaciones; jamás se mezclan compañías. Tu diagrama debe sostener eso.

Del caso (`CASO.md`): 6 familias de archivo, 7 reglas R-P1..T1 ya decididas (12-oct), organigrama con Planeación/Calidad/Almacén/Admin, 5 máquinas, flujo programa→recepción→inventario→turno con confirmación humana que libera (R-Q1).

Del stack: PostgreSQL 18 + pgvector (`uuid`, `text`, `bigint`, `timestamptz`, `date`, `jsonb`, `vector(768)`, uniques, índices, `CHECK`). Local/offline: PCs en la misma red, sin nube, mínimos recursos. Nada puede exigir internet ni hardware especial.

Restricciones duras: sin `Empresa` multi-tenant; reglas, familias, roles y umbrales viven como datos, nunca como `if`; bitácora/historial/originales son solo-insert.

## 2. Lo que debes pensar (antes de dibujar)

La pregunta central: ¿cómo almacenamos lo crudo y cómo conviven tres clases de datos?

- **Fijos del sistema (nunca cambian):** roles, permisos, estados, severidades, familias base. ¿En qué tablas viven? ¿Qué los hace inmutables?
- **Dinámicos (dependen del cliente y de lo consumido):** órdenes, rollos, programas, pruebas, usuarios y departamentos de cada instalación. ¿Qué los ata a su instalación? ¿Qué impide que una instalación lea otra?
- **Manuales (los agrega una persona):** confirmaciones, motivos de cuarentena, decisiones. ¿Dónde queda quién/cuándo/por qué, y qué impide reescribirlos?

Piensa también: ¿dónde muere un dato inválido y con qué motivo? ¿Qué es único en cada tabla y por qué? ¿Qué índice necesita cada consulta de lineage y auditoría?

## 3. Objetivo y resultado esperado

### Ya está (no lo rehaces, lo extiendes)

| Pieza | Estado | Evidencia |
|---|---|---|
| Área `core` del ER | Hecho: 10 tablas (`facility`, `department`, `app_user`, `role`, `user_role`, `permission`, `role_permission`, `domain`, `user_domain`, `access_grant`), 2 páginas, 22 aristas | `docs/ingenieria/DIAGRAMA-BD-v0.drawio` + `DIAGRAMA-BD-v0.md` |
| Trazabilidad diagrama ↔ texto | Verde: SHA-256 declarado, matriz de clases bidireccional, un SVG por página | `bun run diagramas:check` → `2 pages, 10 tables traced to text, 0 problems` |
| Toolchain de Prisma | Listo: Prisma 7.10.0 + `@prisma/adapter-pg` + `pg`, `apps/api/prisma.config.ts`, scripts `db:*` | ADR-0004, `apps/api/package.json` |

### Falta (tu entregable)

| Entregable | Evidencia |
|---|---|
| ER completo (áreas `ingest`, `graph`, `truth`, `config`, `platform`) | `DIAGRAMA-BD-v0.drawio` + texto derivado con las tablas nuevas, cada una en el registro de decisiones y en la matriz de clases |
| Registro de decisiones | Por cada tabla: qué clase de dato guarda, por qué existe, qué constraint lleva y por qué |
| Matriz de clases | Cada tabla marcada: fija, dinámica o manual |
| DDL y migración | `apps/api/prisma/schema.prisma` (datasource **sin** `url`, `embedding Unsupported("vector(768)")?`) + `apps/api/prisma/migrations/0_baseline/migration.sql` con `CREATE EXTENSION IF NOT EXISTS vector` |
| Vistas y triggers | Vistas de lectura (oficial, lineage) y triggers de solo-insert en la migración; su porqué en el registro |
| Migración aplicada en base limpia | Salida de `bun run db:migrate` (o `db:deploy`) sobre el Postgres de Docker, pegada en el PR |
| ADR-0019 | `docs/decisiones/ADR-0019-*.md` con la plantilla `docs/plantillas/ADR.md`: afirma el modelo híbrido (dominio genérico + tablas del sistema) |
| `MODELO-DATOS.md` al día | Reescrito en el mismo PR para que case con el ER (hoy nombra tablas en camelCase que no existen en el diagrama) |
| Contrato con SHA | El `.drawio` declara su SHA-256 y el texto derivado lo verifica: `bun run diagramas:check` en verde |

Tú propones las tablas. La revisión del 12-nov las afirma o las devuelve con motivos.

**Pendiente que ya está detectado y es tuyo:** `access_grant.target_entity_id`
apunta a `entity(id)`, y `entity` pertenece a una fase que todavía no está en
el diagrama. O la das de alta en este PR o dejas la FK sin referencias
declarando por qué.

## 4. Cómo verificar tu propuesta

1. Cada tabla del diagrama existe en el registro con su porqué. Terminado: cero tablas "porque sí".
2. Cada unique/`CHECK`/FK responde a una regla del caso o a una amenaza (instalación que lee otra, inválido que pasa, historia que se reescribe). Terminado: trazabilidad regla→constraint.
3. El ER se ve en el PR (draw.io + SVG, ADR-0017); si hace falta probar el núcleo, se usa https://postgres.new. Terminado: diagrama visible en el PR.
4. Nada exige nube ni hardware especial. Terminado: checklist offline en el PR.
5. La migración aplica en una base limpia y el gate de Prisma pasa. Terminado: salida de `bun run prisma:check` en verde en el PR.

## 5. Entradas y salidas

- Recibe: `CASO.md`, `REQUISITOS.md` (RF-06/08), ADR-0009/0010/0011/0014/0004,
  memorias del equipo en Engram (búscalas antes de decidir).
- Entrega: a #59 y a Erik, por PR desde `feat/58-diagrama-v0`.

## 6. Caja de herramientas (tú eliges cuáles usar)

Principio: este brief te da contexto y restricciones duras, no el diseño.
Tú propones las tablas con tu criterio; la revisión del 12-nov las afirma
o las devuelve con motivos. Nada se cierra antes de que propongas.

Para decidir solo, sin depender de nadie:

- `docs/proyecto/CASO.md` — tu materia prima: 6 familias, 7 reglas
  R-P1..T1, organigrama (Planeación/Calidad/Almacén/Admin), 5 máquinas,
  flujo programa→recepción→inventario→turno con confirmación humana (R-Q1).
  Cada tabla que propongas debe rastrearse a algo de aquí.
- `docs/proyecto/REQUISITOS.md` — RF-08 (qué familias debe sostener el
  modelo) y RF-06 (qué alcance por instalación/departamento/rol debe impedir
  lecturas cruzadas). Si el requisito no te dice el tipo, tú lo propones.
- ADR-0009 (`docs/decisiones/ADR-0009-reglas-del-caso-como-datos.md`) —
  reglas, familias, roles y umbrales como datos, nunca como `if`.
- ADR-0010 (`docs/decisiones/ADR-0010-bitacora-e-historial-solo-insert.md`) —
  bitácora, historial y originales son solo-insert: tu diseño debe impedir
  reescrituras.
- ADR-0011 (`docs/decisiones/ADR-0011-api-encola-worker-procesa.md`) —
  la API encola y el worker procesa: no diseñes para un monolito síncrono.
- ADR-0014 (`docs/decisiones/ADR-0014-instalacion-single-company.md`) —
  raíz Instalación single-company: sin tabla `Empresa` multi-tenant.
- ADR-0004 (`docs/decisiones/ADR-0004-prisma-postgresql-pgvector.md`) — el
  toolchain ya está instalado y es la ley: Prisma 7.10.0 con
  `@prisma/adapter-pg`, la URL de la base **solo** en `prisma.config.ts`, el
  `datasource` sin `url`, `embedding Unsupported("vector(768)")?` y la
  migración inicial en `prisma/migrations/0_baseline/migration.sql`.
- `docs/ingenieria/DIAGRAMA-BD-v0.md` §0.5 — los tipos permitidos
  (`uuid`, `text`, `bigint`, `timestamptz`, `date`, `jsonb`, `vector(768)`,
  uniques, índices, `CHECK`; enums por `CHECK`, no tipo nativo).
  `docs/ingenieria/STACK.md` §2.4 es la referencia de Prisma 7 y Postgres 18,
  no la lista de tipos.
- Diagramas: ER en draw.io (`.drawio` + SVG exportado, ADR-0017); flujos en
  Mermaid (ADR-0016). Ver `ingenieria/DIAGRAMAS.md`. Núcleo ejecutable en https://postgres.new y JSON
  anidados en https://jsoncrack.com son opcionales, no entregable.
- Patrones y trampas (solo lectura): skill `ecc-prisma-patterns`; memoria
  del equipo en Engram (búscala con `/inicio` antes de decidir); guía de
  docs con `docu-documentar`; plantilla de ADR en `docs/plantillas/ADR.md`.
- `docs/gestion/PLAN-EPICAS.md` orden 6 — qué espera #59 de ti: un v0
  afirmado sobre el que iterar, no un modelo perfecto.

Lo que NO te limitamos: nombres de tablas, cuántas son, cómo agrupas lo
fijo/dinámico/manual, orden del registro. Lo que sí se devuelve con
motivos: tabla sin porqué escrito, `Empresa` multi-tenant, diagrama que no está
en draw.io (ADR-0017).

## 7. Cómo trabajar

- `bash scripts/setup.sh`, `opencode`, `/inicio`, `/tarea 58`. Rama
  `feat/58-diagrama-v0` (desde `main`, con `scripts/rama-env.sh`).
- **Paso 0 (listo, no lo repitas):** el toolchain está instalado. Desde
  `apps/api`: `bun run db:validate`, `bun run db:generate`, `bun run db:migrate`.
  La URL de la base sale del `.env` de la raíz por `prisma.config.ts`; no
  exportes variables a mano.
- **Puertas de tu PR:** `bun run diagramas:check` (el `.drawio` y el texto
  derivado no pueden desincronizarse), `bun run prisma:check` (schema válido,
  cliente generado, migración baseline con la extensión `vector`), `bun run lint`,
  `bun run typecheck` y `bun run verify` completo. La migración se prueba en
  una base limpia.
- EMMANUEL NO DEBE: inventar datos de planta; simular entrevistas.
- EMMANUEL SÍ DEBE: decidir y justificar por escrito; `.env` fuera del repo.
- Duda 30 min en el issue; bloqueo >24 h con `bloqueado`. 1 issue En progreso.

## 8. Criterios de aceptación

- [ ] El ER completo (6 áreas) se ve en el PR; cada tabla con clase y porqué registrados.
- [ ] Trazabilidad regla→constraint completa; R-P1..T1 como datos.
- [ ] `schema.prisma` valida y genera cliente: salida de `bun run prisma:check` en verde.
- [ ] La migración `0_baseline` aplica en base limpia y crea la extensión `vector`.
- [ ] Vistas y triggers en la migración, con su prueba de solo-insert.
- [ ] ADR-0019 en el repo con estado `Propuesta` → `Aceptada` al aprobarse.
- [ ] `MODELO-DATOS.md` reescrito para que case con el ER.
- [ ] Capturas `postgres.new` adjuntas; checklist offline.
- [ ] Afirmado del equipo en #58 el 12-nov.

No es done si: hay tablas sin porqué; aparece `Empresa`; el diagrama no está en draw.io (ADR-0017); la migración no aplica en limpio.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** El ER de C1 es **híbrido**: un dominio genérico (`entity_type`,
`entity`, `relation`) para lo que el caso no anticipa, más las tablas
concretas y estables del sistema (`ingest`, `truth`, `config`, `platform`). El
archivo `.drawio` es la fuente; el texto derivado es lo que se lee y lo que se
revisa; la migración es lo que corre.

**Criterios (Given/When/Then).**

1. **Given** una variación del dataset con una familia nueva, **when** se
   registra, **then** el sistema la procesa o la manda a cuarentena con motivo,
   sin romper nada.
2. **Given** la migración aplicada, **when** se intenta reescribir un original,
   un histórico o una bitácora, **then** la base lo rechaza (solo-insert).
3. **Given** el texto derivado, **when** alguien lo compara con el `.drawio`,
   **then** coinciden tabla por tabla, y `bun run diagramas:check` lo confirma.
4. **Given** el schema y la migración, **when** se corre `bun run prisma:check`
   en CI, **then** valida el schema, genera el cliente y encuentra la baseline.

**Plan de pruebas.** `bun run diagramas:check` (texto derivado vs fuente),
`bun run prisma:check` (schema + cliente + baseline), migración de Prisma
aplicada en base limpia, prueba de solo-insert sobre la base levantada y
prueba de la familia nueva.

**Evidencia.** El `.drawio`, el texto derivado, la salida de la migración, el
resultado de `diagramas:check` y de `prisma:check`, y las dos pruebas de schema.

**Listo cuando.** ER afirmado, migración aplicada, vistas y triggers
funcionando, y el contrato con su SHA (eso cierra #62 y #23).

## 9. Riesgos nombrados

El dataset revela formas que el v0 no previó. No es bloqueo: eso lo absorbe #59.

Riesgo de hoy: el ER va en 6 fases y solo 1 está hecha. Mitigación: el 12-nov se
afirma **lo que esté**, con el resto escrito como fase pendiente en el ADR-0019
y en el registro de decisiones; no se entrega un modelo a medias sin saying
qué falta.

## 10. Revisión

Jueves 12-nov en el sync, con Carlos y Emmanuel: afirmación o devolución motivada. Después: #60, #62 y #23.

## Versión corta (descripción del issue)

> [58] ER v1 — Agent3835, 2→10-nov. Diseño completo de la base: ER híbrido, DDL, enums, vistas, triggers y migración aplicada. Entradas recibidas de docs/gestion/REPLAN-2026-10-30.md §3 y de docs/ingenieria/DIAGRAMA-BD-v0.md. Entregable: draw.io fuente + texto derivado + migración aplicada + contrato con SHA. Revisión el 10-nov. Detalle: `docs/briefs/BRIEF-58-diagrama-v0.md`.
