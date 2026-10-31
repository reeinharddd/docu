# BRIEF #61 — Dataset genérico y comprobable del mes

## 0. Encabezado

- Issue: #61
- Dueño: Carlos.
- Fechas: 2026-11-02 → 2026-11-17 · Sprint 3 · hito `C1 vertical completa` (19-nov).
- Prioridad / Tipo / Épica: alta / tarea / QA-Documentación.
- Requisitos: RNF-02, RNF-07.
- Bloqueado por: #83 (caso), #58 (DDL) · Bloquea a: #59, #85, #86
- El generador se desarrolla en paralelo desde el 2-nov; **solo la emisión espera al contrato** (12-nov). Las fichas de documentos son el contrato: sin fichas aprobadas no se emite el corpus.

## 1. Contexto

Con fichas aprobadas y datos crudos (perfiles #29 + formatos #9), la generación se automatiza: tantos documentos como se quieran, todos predecibles, todos con *ground truth*. Este brief construye ese sistema más el dataset C1 y el plan de pruebas.

## 2. Por qué importa tu parte

Sin generador, cada prueba futura pide documentos a mano. Si sale bien, cualquier volumen se regenera idéntico con un comando hasta la entrega.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Generador reproducible | `bun dataset/generar.ts --seed 42` regenera idéntico (script + config + CSV commiteados; binarios no) |
| Dataset C1 completo | ~170 archivos + 30–40 de ruido, con los conteos de `CONTRATO.md` §8 (archivos y revisiones por familia) y su reparto válido/inválido/ambiguo |
| Plan y casos de prueba base | `docs/ingenieria/PRUEBAS.md`: 1 caso por RF con su evidencia |

## 4. Actividades específicas

1. Escribir el generador desde las fichas y los esquemas (`dataset/config1/esquemas/`, JSON Schema draft 2020-12): plantillas en `dataset/plantillas/` (Excel `xlsx`, PDF `pdf-lib`, `.eml`, escaneados por render + degradado 150/300 dpi con Sharp/ImageMagick) + CSV de *ground truth* automático. Terminado: regenera idéntico.
2. Producir el dataset C1 con los conteos de las fichas. Terminado: conteos verificados.
3. Escribir `PRUEBAS.md` desde "Pruebas que exige cada requisito". Terminado: 1 caso por RF.

## 5. Entradas y salidas

- Recibe: fichas aprobadas (#9), perfiles (#29).
- Entrega: dataset y plan a todo el equipo (sirven a #32 resto, #3, #6), por PR desde `feat/61-generador`. C2 reutiliza el generador con otra config.

## 6. Referencias y caja de herramientas

- https://fakerjs.dev (`faker.seed()`, locale `es`) · https://docs.sheetjs.com · https://pdf-lib.js.org · https://sharp.pixelplumbing.com + https://imagemagick.org · https://poppler.freedesktop.org (`pdftoppm -r 150/300`).
- Automatizable obligatorio: script con semilla; nunca archivos ni CSV a mano.

## 7. Cómo trabajar

- `/tarea 61`, 1 issue En progreso. Binarios al `.gitignore`. Sin nombres reales de planta.

## 8. Criterios de aceptación

- [ ] Regenera idéntico con `--seed 42`.
- [ ] Los conteos de `CONTRATO.md` §8 (archivos, revisiones, ruido y reparto por regla).
- [ ] `PRUEBAS.md` con 1 caso por RF; `bun run verify` verde.

No es done si: hay archivos o CSV a mano; los conteos no cuadran con las fichas y `CONTRATO.md` §8.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** El generador produce el corpus del mes de forma determinista:
60 turnos × 6 familias, válidos y con error, y un **manifiesto SHA-256** que
lo describe. El dataset **no se versiona**: vive en el entorno y se regenera.

**Criterios (Given/When/Then).**

1. **Given** la misma semilla, **when** se genera el corpus dos veces, **then**
   los archivos y el manifiesto SHA-256 son idénticos.
2. **Given** el corpus emitido, **when** se compara con el manifiesto, **then**
   el conteo por familia y cada hash cuadran.
3. **Given** una familia nueva que el caso agrega, **when** se genera el
   corpus, **then** el generador la incluye sin código nuevo: son datos.

**Plan de pruebas.** Dos generaciones seguidas comparando hashes, validación
del conteo por familia contra `docs/ingenieria/fichas/CONTRATO.md` §8, y el
`dataset:check` del repo cuando exista.

**Evidencia.** El manifiesto SHA-256, el conteo por familia y la salida de las
dos generaciones, en el PR con `Closes #61`.

**Listo cuando.** Otra persona puede regenerar el corpus y obtener los mismos
hashes.

## 9. Riesgos nombrados

El generador se come la semana. Mitigación: fichas cerradas el 17-oct (sin cambios después salvo issue); desde el 21-oct sin generador corriendo es bloqueo.

## 10. Revisión

Martes 17-nov con Erik: dataset + manifiesto. Después: #59 seed, #85 IA y #86 replicabilidad.

## Versión corta (descripción del issue)


> [61] Dataset del mes — WearyBerry, 2→17-nov. Dataset genérico y comprobable: se genera con el generador determinista y no se versiona, solo su manifiesto SHA-256. Entradas recibidas de docs/gestion/REPLAN-2026-10-30.md §6 y de docs/ingenieria/fichas/CONTRATO.md. Entregable: dataset físico generado, con manifiesto SHA-256 y la evidencia de que es reproducible. Revisión el 17-nov. Detalle: `docs/briefs/BRIEF-61-generador-dataset.md`.

