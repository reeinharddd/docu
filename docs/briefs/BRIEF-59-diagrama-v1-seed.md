# BRIEF #59 — Seed reproducible desde el dataset

## 0. Encabezado

- Issue: #59
- Dueño: Emmanuel Valenzuela Cruz (Backend).
- Fechas: 2026-11-17 → 2026-11-18 · Sprint 3 · hito `C1 vertical completa` (19-nov)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Base de datos / base de datos.
- Requisitos: RF-08
- Bloqueado por: #58, #61 · Bloquea a: #7, #86

## 1. Contexto

El v0 (#58) se afirmó con lo básico. Este brief lo refina con lo que el dataset de Carlos revela (columnas, medidas, errores reales) hasta v1 afirmado, y escribe el seed reproducible de C1. Termina con v1 + seed verificados. La carga y el reporte son otro brief (#7).

## 2. Por qué importa tu parte

Sin DDL aplicado, el seed carga a ciegas y el contrato del 12-nov se congela en el aire. Si sale bien, #7 carga solo con datos y el modelo queda documentado en #62.

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

## 6. Referencias y caja de herramientas

- `ecc-prisma-patterns` (obligatoria), v0, `CASO.md`, ADR-0009/0010.
- https://dbdiagram.io · https://postgres.new · https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding (seed idempotente).
- Comandos: `bunx prisma migrate dev` desde `apps/api`, `bun run verify`.

## 7. Cómo trabajar

- `/tarea 59`, rama `feat/59-seed-reproducible`. Dos syncs con Carlos (17 y 18-nov).
- EMMANUEL NO DEBE: cambiar la raíz `Instalacion`; meter familias con código; tocar migraciones antes de afirmar v1.
- TypeScript estricto, `.env` fuera del repo. Bloqueo >24 h con `bloqueado`.

## 8. Criterios de aceptación

- [ ] Seed idempotente, con el conteo por familia igual al manifiesto SHA-256.
- [ ] Seed idempotente con semilla; `git diff` de código vacío.
- [ ] 1 caso por constraint nuevo; verify verde.
- [ ] Todo en local/offline.

No es done si: reaparece `Empresa`; el seed no regenera idéntico.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** El seed carga el dataset del mes en la base de forma
determinista: misma entrada, misma salida, sin depender del orden ni del
estado previo.

**Criterios (Given/When/Then).**

1. **Given** la base vacía y el dataset del mes, **when** corre el seed, **then**
   el conteo por familia queda igual al manifiesto SHA-256.
2. **Given** la base ya sembrada, **when** corre el seed otra vez, **then** el
   resultado es idéntico y no hay filas duplicadas.
3. **Given** un archivo inválido del dataset, **when** corre el seed, **then**
   se registra como error esperado con su motivo, sin abortar la carga.

**Plan de pruebas.** Dos corridas seguidas con comparación de conteos y hashes,
la suite de la API en verde (#45) y la corrida completa con su salida pegada.

**Evidencia.** Conteo por familia en las dos corridas, el manifiesto SHA-256 del
dataset y el PR con `Closes #59`.

**Listo cuando.** Dos corridas del seed dan el mismo resultado y el conteo
cuadra con el manifiesto.

## 9. Riesgos nombrados

Dataset incompleto al 17-nov. Mitigación: syncs 17/18; desde el 18-nov sin dataset completo es bloqueo (frena el seed y #7).

## 10. Revisión

Miércoles 18-nov en el sync: demo del seed con dos corridas idénticas. Después: #7 carga.

## Versión corta (descripción del issue)


> [59] Seed reproducible — Agent3835, 17→18-nov. Seed determinista que carga el dataset en la base sin depender del orden ni del estado previo. Entradas recibidas de docs/ingenieria/fichas/CONTRATO.md y del manifiesto SHA-256 del dataset. Entregable: seed idempotente, con la evidencia de que dos corridas dan el mismo resultado. Revisión el 18-nov. Detalle: `docs/briefs/BRIEF-59-diagrama-v1-seed.md`.

