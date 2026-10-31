# BRIEF #58 — ER v1 de C1: draw.io fuente + texto derivado, DDL, vistas, triggers y migración

## 0. Encabezado

- Issue: #58
- Dueño: Erik Alfonso Beltrán Ramírez (Líder, infra).
- Fechas: 2026-11-02 → 2026-11-12 · Sprint 3 · hito `C1 modelo y BD` (12-nov)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Base de datos / base de datos.
- Requisitos: RF-08
- Bloqueado por: #83 (caso cerrado) · Bloquea a: #60, #62, #23, #44, #5, #59, #61, #85
- Nota (2026-10-18): ADR-0016 cambió el entregable de "DBML + PNG" a **Mermaid**.
- Nota (2026-10-19): ADR-0017 pasó el ER a **draw.io** (`.drawio` + SVG exportado
  por página, `ingenieria/DIAGRAMAS.md`); Mermaid queda para flujos y secuencias.

## 1. Contexto que te damos (tú decides el qué)

Despliegue: una compañía corre su propio sistema; en él conviven sus instalaciones; jamás se mezclan compañías. Tu diagrama debe sostener eso.

Del caso (`CASO.md`): 6 familias de archivo, 7 reglas R-P1..T1 ya decididas (12-oct), organigrama con Planeación/Calidad/Almacén/Admin, 5 máquinas, flujo programa→recepción→inventario→turno con confirmación humana que libera (R-Q1).

Del stack: PostgreSQL 18 + pgvector (`uuid`, `text`, `bigint`, `timestamptz`, `date`, `jsonb`, `vector(768)`, uniques, índices, `CHECK`). Local/offline: PCs en la misma red, sin nube, mínimos recursos. Nada puede exigir internet ni hardware especial.

Restricciones duras: sin `Empresa` multi-tenant; no hay esquema implementado todavía; reglas, familias, roles y umbrales viven como datos, nunca como `if`; bitácora/historial/originales son solo-insert.

## 2. Lo que debes pensar (antes de dibujar)

La pregunta central: ¿cómo almacenamos lo crudo y cómo conviven tres clases de datos?

- **Fijos del sistema (nunca cambian):** roles, permisos, estados, severidades, familias base. ¿En qué tablas viven? ¿Qué los hace inmutables?
- **Dinámicos (dependen del cliente y de lo consumido):** órdenes, rollos, programas, pruebas, usuarios y departamentos de cada instalación. ¿Qué los ata a su instalación? ¿Qué impide que una instalación lea otra?
- **Manuales (los agrega una persona):** confirmaciones, motivos de cuarentena, decisiones. ¿Dónde queda quién/cuándo/por qué, y qué impide reescribirlos?

Piensa también: ¿dónde muere un dato inválido y con qué motivo? ¿Qué es único en cada tabla y por qué? ¿Qué índice necesita cada consulta de lineage y auditoría?

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Diagrama v0 afirmado | `docs/ingenieria/DIAGRAMA-BD-v0.md` (draw.io, ER por área, SVG embebido) visible en el PR; aprobado en #58 |
| Registro de decisiones | Por cada tabla: qué clase de dato guarda, por qué existe, qué constraint lleva y por qué |
| Matriz de clases | Cada tabla marcada: fija, dinámica o manual |

Tú propones las tablas. La revisión del 12-nov las afirma o las devuelve con motivos.

## 4. Cómo verificar tu propuesta

1. Cada tabla del diagrama existe en el registro con su porqué. Terminado: cero tablas "porque sí".
2. Cada unique/`CHECK`/FK responde a una regla del caso o a una amenaza (instalación que lee otra, inválido que pasa, historia que se reescribe). Terminado: trazabilidad regla→constraint.
3. El ER se ve en el PR (draw.io + SVG, ADR-0017); si hace falta probar el núcleo, se usa https://postgres.new. Terminado: diagrama visible en el PR.
4. Nada exige nube ni hardware especial. Terminado: checklist offline en el PR.

## 5. Entradas y salidas

- Recibe: `CASO.md`, `REQUISITOS.md` (RF-06/08), ADR-0009/0010/0011, memorias del equipo en Engram (búscalas antes de decidir).
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
- `docs/ingenieria/STACK.md` §2.4 — tipos permitidos (`uuid`, `text`,
  `bigint`, `timestamptz`, `date`, `jsonb`, `vector(768)`), uniques, índices,
  `CHECK`. PostgreSQL 18 + pgvector: https://www.postgresql.org/docs/18/ ·
  https://github.com/pgvector/pgvector.
- Diagramas: ER en draw.io (`.drawio` + SVG exportado, ADR-0017); flujos en
  Mermaid (ADR-0016). Ver `ingenieria/DIAGRAMAS.md`. Núcleo ejecutable en https://postgres.new y JSON
  anidados en https://jsoncrack.com son opcionales, no entregable.
- Patrones y trampas (solo lectura): skill `ecc-prisma-patterns`; memoria
  del equipo en Engram (búscala con `/inicio` antes de decidir); guía de
  docs con `docu-documentar`.
- `docs/gestion/PLAN-EPICAS.md` orden 6 — qué espera #59 de ti: un v0
  afirmado sobre el que iterar, no un modelo perfecto.

Lo que NO te limitamos: nombres de tablas, cuántas son, cómo agrupas lo
fijo/dinámico/manual, orden del registro. Lo que sí se devuelve con
motivos: tabla sin porqué escrito, `Empresa` multi-tenant, diagrama que no está
en draw.io (ADR-0017).

## 7. Cómo trabajar

- `bash scripts/setup.sh`, `opencode`, `/inicio`, `/tarea 58`. Rama `feat/58-diagrama-v0`.
- EMMANUEL NO DEBE: inventar datos de planta; simular entrevistas.
- EMMANUEL SÍ DEBE: decidir y justificar por escrito; `.env` fuera del repo.
- Duda 30 min en el issue; bloqueo >24 h con `bloqueado`. 1 issue En progreso.

## 8. Criterios de aceptación

- [ ] El ER (draw.io, SVG embebido) se ve en el PR; cada tabla con clase y porqué registrados.
- [ ] Trazabilidad regla→constraint completa; R-P1..T1 como datos.
- [ ] Capturas `postgres.new` adjuntas; checklist offline.
- [ ] Afirmado del equipo en #58 el 12-nov.

No es done si: hay tablas sin porqué; aparece `Empresa`; el diagrama no está en draw.io (ADR-0017).

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** El ER de C1 es **híbrido**: un dominio genérico (`entity_type`,
`entity`, `relation`) para lo que el caso no anticipa, más las tablas
concretas y estables del sistema (`ingest`, `truth`, `config`, `platform`). El
archivo `.drawio` es la fuente; el texto derivado es lo que se lee y lo que se
revisa.

**Criterios (Given/When/Then).**

1. **Given** una variación del dataset con una familia nueva, **when** se
   registra, **then** el sistema la procesa o la manda a cuarentena con motivo,
   sin romper nada.
2. **Given** la migración aplicada, **when** se intenta reescribir un original,
   un histórico o una bitácora, **then** la base lo rechaza (solo-insert).
3. **Given** el texto derivado, **when** alguien lo compara con el `.drawio`,
   **then** coinciden tabla por tabla, y `bun run diagramas:check` lo confirma.

**Plan de pruebas.** `bun run diagramas:check` (texto derivado vs fuente),
migración de Prisma aplicada en limpio, prueba de solo-insert sobre la base
levantada y prueba de la familia nueva.

**Evidencia.** El `.drawio`, el texto derivado, la salida de la migración, el
resultado de `diagramas:check` y las dos pruebas de schema.

**Listo cuando.** ER afirmado, migración aplicada, vistas y triggers
funcionando, y el contrato con su SHA (eso cierra #62 y #23).

## 9. Riesgos nombrados

El dataset revela formas que el v0 no previó. No es bloqueo: eso lo absorbe #59.

## 10. Revisión

Jueves 12-nov en el sync, con Carlos y Emmanuel: afirmación o devolución motivada. Después: #60, #62 y #23.

## Versión corta (descripción del issue)


> [58] ER v1 — reeinharddd, 2→12-nov. Diseño completo de la base: ER híbrido, DDL, enums, vistas, triggers y migración aplicada. Entradas recibidas de docs/gestion/REPLAN-2026-10-30.md §3 y de docs/ingenieria/DIAGRAMA-BD-v0.md. Entregable: draw.io fuente + texto derivado + migración aplicada + contrato con SHA. Revisión el 12-nov. Detalle: `docs/briefs/BRIEF-58-diagrama-v0.md`.

