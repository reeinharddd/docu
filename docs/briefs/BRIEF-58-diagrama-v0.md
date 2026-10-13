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

Restricciones duras: sin `Empresa` multi-tenant; `schema.prisma` es placeholder sin validez (no lo uses); reglas, familias, roles y umbrales viven como datos, nunca como `if`; bitácora/historial/originales son solo-insert.

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

- `ecc-prisma-patterns` (patrones y trampas), `docu-documentar`, `docu-memoria`.
- https://dbdiagram.io o https://app.diagrams.net · https://www.postgresql.org/docs/18/ · https://github.com/pgvector/pgvector · `STACK.md` §2.4.

## 7. Cómo trabajar

- `bash scripts/setup.sh`, `opencode`, `/inicio`, `/tarea 58`. Rama `feat/58-diagrama-v0`.
- EMMANUEL NO DEBE: copiar el placeholder; inventar datos de planta; simular entrevistas; tocar `apps/api/prisma/*`.
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
