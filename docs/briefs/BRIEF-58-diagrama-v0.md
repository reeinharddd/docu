# BRIEF #58 — Diagrama BD v0 (diseño, termina afirmado)

## 0. Encabezado

- Issue: #58
- Dueño: Emmanuel Valenzuela Cruz (Backend).
- Fechas: 2026-10-13 → 2026-10-16 · Sprint 1
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Base de datos / base de datos.
- Requisitos: RF-08
- Bloqueado por: nada · Bloquea a: #59

## 1. Contexto que te damos (tú decides el qué)

Despliegue: una compañía corre su propio sistema; en él conviven sus plantas; jamás se mezclan compañías. Tu diagrama debe sostener eso.

Del caso (`CASO.md`): 6 familias de archivo, 7 reglas R-P1..T1 ya decididas (12-oct), organigrama con Planeación/Calidad/Almacén/Admin, 5 máquinas, flujo programa→recepción→inventario→turno con confirmación humana que libera (R-Q1).

Del stack: PostgreSQL 18 + pgvector (`uuid`, `text`, `bigint`, `timestamptz`, `date`, `jsonb`, `vector(768)`, uniques, índices, `CHECK`). Local/offline: PCs en la misma red, sin nube, mínimos recursos. Nada puede exigir internet ni hardware especial.

Restricciones duras: sin `Empresa` multi-tenant; no hay esquema implementado todavía; reglas, familias, roles y umbrales viven como datos, nunca como `if`; bitácora/historial/originales son solo-insert.

## 2. Lo que debes pensar (antes de dibujar)

La pregunta central: ¿cómo almacenamos lo crudo y cómo conviven tres clases de datos?

- **Fijos del sistema (nunca cambian):** roles, permisos, estados, severidades, familias base. ¿En qué tablas viven? ¿Qué los hace inmutables?
- **Dinámicos (dependen del cliente y de lo consumido):** órdenes, rollos, programas, pruebas, usuarios y departamentos de cada planta. ¿Qué los ata a su planta? ¿Qué impide que una planta lea otra?
- **Manuales (los agrega una persona):** confirmaciones, motivos de cuarentena, decisiones. ¿Dónde queda quién/cuándo/por qué, y qué impide reescribirlos?

Piensa también: ¿dónde muere un dato inválido y con qué motivo? ¿Qué es único en cada tabla y por qué? ¿Qué índice necesita cada consulta de lineage y auditoría?

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Diagrama v0 afirmado | `docs/ingenieria/DIAGRAMA-BD-v0.dbml` + PNG generado del `.dbml`; aprobado en #58 |
| Registro de decisiones | Por cada tabla: qué clase de dato guarda, por qué existe, qué constraint lleva y por qué |
| Matriz de clases | Cada tabla marcada: fija, dinámica o manual |

Tú propones las tablas. La revisión del 16-oct las afirma o las devuelve con motivos.

## 4. Cómo verificar tu propuesta

1. Cada tabla del diagrama existe en el registro con su porqué. Terminado: cero tablas "porque sí".
2. Cada unique/`CHECK`/FK responde a una regla del caso o a una amenaza (planta que lee otra, inválido que pasa, historia que se reescribe). Terminado: trazabilidad regla→constraint.
3. El núcleo se crea en https://postgres.new y los JSON anidados se inspeccionan en https://jsoncrack.com. Terminado: capturas en el PR.
4. Nada exige nube ni hardware especial. Terminado: checklist offline en el PR.

## 5. Entradas y salidas

- Recibe: `CASO.md`, `REQUISITOS.md` (RF-06/08), ADR-0009/0010/0011, memorias del equipo en Engram (búscalas antes de decidir).
- Entrega: a #59 y a Erik, por PR desde `feat/58-diagrama-v0`.

## 6. Caja de herramientas (tú eliges cuáles usar)

Principio: este brief te da contexto y restricciones duras, no el diseño.
Tú propones las tablas con tu criterio; la revisión del 16-oct las afirma
o las devuelve con motivos. Nada se cierra antes de que propongas.

Para decidir solo, sin depender de nadie:

- `docs/proyecto/CASO.md` — tu materia prima: 6 familias, 7 reglas
  R-P1..T1, organigrama (Planeación/Calidad/Almacén/Admin), 5 máquinas,
  flujo programa→recepción→inventario→turno con confirmación humana (R-Q1).
  Cada tabla que propongas debe rastrearse a algo de aquí.
- `docs/proyecto/REQUISITOS.md` — RF-08 (qué familias debe sostener el
  modelo) y RF-06 (qué alcance por planta/departamento/rol debe impedir
  lecturas cruzadas). Si el requisito no te dice el tipo, tú lo propones.
- ADR-0009 (`docs/decisiones/ADR-0009-reglas-del-caso-como-datos.md`) —
  reglas, familias, roles y umbrales como datos, nunca como `if`.
- ADR-0010 (`docs/decisiones/ADR-0010-bitacora-e-historial-solo-insert.md`) —
  bitácora, historial y originales son solo-insert: tu diseño debe impedir
  reescrituras.
- ADR-0011 (`docs/decisiones/ADR-0011-api-encola-worker-procesa.md`) —
  la API encola y el worker procesa: no diseñes para un monolito síncrono.
- ADR-0014 (`docs/decisiones/ADR-0014-planta-single-company.md`, propuesta) —
  raíz Planta single-company: sin tabla `Empresa` multi-tenant.
- `docs/ingenieria/STACK.md` §2.4 — tipos permitidos (`uuid`, `text`,
  `bigint`, `timestamptz`, `date`, `jsonb`, `vector(768)`), uniques, índices,
  `CHECK`. PostgreSQL 18 + pgvector: https://www.postgresql.org/docs/18/ ·
  https://github.com/pgvector/pgvector.
- Dibujo y prueba: https://dbdiagram.io o https://app.diagrams.net para el
  `.dbml`; núcleo ejecutable en https://postgres.new; JSON anidados en
  https://jsoncrack.com. Capturas de los tres van al PR como evidencia.
- Patrones y trampas (solo lectura): skill `ecc-prisma-patterns`; memoria
  del equipo en Engram (búscala con `/inicio` antes de decidir); guía de
  docs con `docu-documentar`.
- `docs/gestion/PLAN-EPICAS.md` orden 6 — qué espera #59 de ti: un v0
  afirmado sobre el que iterar, no un modelo perfecto.

Lo que NO te limitamos: nombres de tablas, cuántas son, cómo agrupas lo
fijo/dinámico/manual, orden del registro. Lo que sí se devuelve con
motivos: tabla sin porqué escrito, `Empresa` multi-tenant, PNG que no sale
del `.dbml`.

## 7. Cómo trabajar

- `bash scripts/setup.sh`, `opencode`, `/inicio`, `/tarea 58`. Rama `feat/58-diagrama-v0`.
- EMMANUEL NO DEBE: inventar datos de planta; simular entrevistas.
- EMMANUEL SÍ DEBE: decidir y justificar por escrito; `.env` fuera del repo.
- Duda 30 min en el issue; bloqueo >24 h con `bloqueado`. 1 issue En progreso.

## 8. Criterios de aceptación

- [ ] v0 + PNG abren; cada tabla con clase y porqué registrados.
- [ ] Trazabilidad regla→constraint completa; R-P1..T1 como datos.
- [ ] Capturas `postgres.new` adjuntas; checklist offline.
- [ ] Afirmado del equipo en #58 el 16-oct.

No es done si: hay tablas sin porqué; aparece `Empresa`; el PNG no sale del `.dbml`.

## 9. Riesgos nombrados

El dataset revela formas que el v0 no previó. No es bloqueo: eso lo absorbe #59.

## 10. Revisión

Viernes 16-oct en el sync, con Erik y Carlos: afirmación o devolución motivada. Después: #59.

## Versión corta (descripción del issue)

> [58] Diagrama BD v0 — Emmanuel, 13→16-oct. Contexto dado, tablas decididas y justificadas por él, afirmado el 16-oct. Detalle: `docs/briefs/BRIEF-58-diagrama-v0.md`.
