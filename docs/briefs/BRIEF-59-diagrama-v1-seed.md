# BRIEF #59 — Diagrama BD v1 + seed C1

## 0. Encabezado

- Issue: #59
- Dueño: Emmanuel Valenzuela Cruz (Backend).
- Fechas: 2026-10-16 → 2026-10-23 · Sprint 1 · hito Cierre de diseño
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Base de datos / base de datos.
- Requisitos: RF-08, RF-06
- Bloqueado por: #58, #61, #10 · Bloquea a: #7, #62

## 1. Contexto

El v0 (#58) se afirmó con lo básico. Este brief lo refina con lo que el dataset de Carlos revela (columnas, medidas, errores reales) hasta v1 afirmado, y escribe el seed reproducible de C1. Termina con v1 + seed verificados. La carga y el reporte son otro brief (#7).

## 2. Por qué importa tu parte

Sin v1, el seed carga a ciegas y el contrato del 30-oct se congela en el aire. Si sale bien, #7 carga solo con datos y #60 documenta el modelo final.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Diagrama v1 afirmado | `DIAGRAMA-BD-v1.dbml` + PNG + nota de qué cambió vs v0 y por qué |
| Seed C1 reproducible | Script/config con semilla; `git diff` de código vacío salvo datos; 1 caso por constraint nuevo |

## 4. Actividades específicas

1. Pulir el diagrama con cada entrega del dataset: columnas que faltan, formas reales, errores que el v0 no atrapa. Terminado: v1 + nota de cambios.
2. Endurecer constraints: cada error del dataset que pasó el v0 se vuelve `CHECK`, unique o regla como dato. Terminado: 1 caso de prueba por constraint nuevo.
3. Escribir el seed (roles base, estados, familias, reglas R-P1..T1, umbrales). Terminado: regenera idéntico con semilla.
4. Validar: `postgres.new` + `prisma validate` + `migrate` en local/offline. Terminado: capturas + verify verde.

## 5. Entradas y salidas

- Recibe: v0 afirmado (#58), dataset (#61), fichas (#9), entorno (#10).
- Entrega: a #7 (carga) y a #60 (modelo final), por PR desde `feat/59-diagrama-v1-seed`.

## 6. Referencias y caja de herramientas (tú eliges cuáles usar)

Principio: este brief te da contexto y criterio, no el diseño final. Tú
decides cómo refinar el v1 y el seed; la revisión del 23-oct los afirma o
los devuelve con motivos. Nada se cierra antes de que propongas.

Para decidir solo, sin depender de nadie:

- v0 afirmado (#58, `DIAGRAMA-BD-v0.dbml`) — tu punto de partida; la nota
  de cambios vs v0 es entregable, no adorno.
- Dataset y fichas de Carlos (#61, #9): cada error real que el v0 no atrapa
  se vuelve constraint. Syncs 16 y 23-oct para pedir lo que falte.
- `docs/proyecto/CASO.md` — 6 familias, 7 reglas R-P1..T1, flujo con
  confirmación humana (R-Q1).
- `docs/proyecto/REQUISITOS.md` — RF-08 (qué debe sostener) y RF-06
  (alcances que impiden lecturas cruzadas).
- ADR-0009 (reglas como datos), ADR-0010 (solo-insert),
  ADR-0011 (API encola, worker procesa), ADR-0014 (raíz Planta, sin `Empresa`).
- Skill `docu-basedatos` (mecanismos y estándares) + `ecc-prisma-patterns` (obligatoria: trampas de Prisma antes de escribir).
- Dibujo y prueba: https://dbdiagram.io · núcleo en https://postgres.new ·
  seed idempotente: https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding.
- Comandos: `bunx prisma migrate dev` desde `apps/api`, `bun run verify`.
  Entorno listo en #10; si el entorno falla, es bloqueo, no tu bug.

Lo que NO te limitamos: cómo agrupas los refinamientos, orden del seed,
formato de la nota de cambios. Lo que sí se devuelve con motivos: cambiar
la raíz `Planta`, familias con código, migraciones antes de afirmar v1,
`Empresa` multi-tenant.

## 7. Cómo trabajar

- `/tarea 59`, rama `feat/59-diagrama-v1-seed`. Dos syncs con Carlos (16 y 23-oct).
- EMMANUEL NO DEBE: cambiar la raíz `Planta`; meter familias con código; tocar migraciones antes de afirmar v1.
- TypeScript estricto, `.env` fuera del repo. Bloqueo >24 h con `bloqueado`.

## 8. Criterios de aceptación

- [ ] v1 + PNG afirmados el 23-oct, con nota de cambios vs v0.
- [ ] Seed idempotente con semilla; `git diff` de código vacío.
- [ ] 1 caso por constraint nuevo; verify verde.
- [ ] Todo en local/offline.

No es done si: reaparece `Empresa`; el seed no regenera idéntico.

## 9. Riesgos nombrados

Dataset incompleto al 23-oct. Mitigación: syncs 16/23; desde el 23-oct sin dataset completo es bloqueo (frena seed y #7).

## 10. Revisión

Viernes 23-oct en el sync: afirmación v1 + demo del seed. Después: #7 carga, #60 documenta.

## Versión corta (descripción del issue)

> [59] Diagrama v1 + seed — Emmanuel, 16→23-oct. Refina con dataset, endurece constraints, seed reproducible. Requiere #58 + #9 + #10. Detalle: `docs/briefs/BRIEF-59-diagrama-v1-seed.md`.
