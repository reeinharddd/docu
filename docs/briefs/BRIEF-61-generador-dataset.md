# BRIEF #61 — Generador automático + dataset + plan de pruebas

## 0. Encabezado

- Issue: #61
- Dueño: Carlos.
- Fechas: 2026-10-19 → 2026-10-23 · Sprint 1 · hito `Cierre de diseño` (2026-10-23).
- Prioridad / Tipo / Épica: alta / tarea / QA-Documentación.
- Requisitos: RNF-02, RNF-07.
- Bloqueado por: #9 · Bloquea a: #32, #3, #6
- Este brief construye el sistema; pensar los documentos fue #9. Sin fichas aprobadas no se genera nada.

## 1. Contexto

Con fichas aprobadas y datos crudos (perfiles #29 + formatos #9), la generación se automatiza: tantos documentos como se quieran, todos predecibles, todos con *ground truth*. Este brief construye ese sistema más el dataset C1 y el plan de pruebas.

## 2. Por qué importa tu parte

Sin generador, cada prueba futura pide documentos a mano. Si sale bien, cualquier volumen se regenera idéntico con un comando hasta la entrega.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Generador reproducible | `bun dataset/generar.ts --seed 42` regenera idéntico (script + config + CSV commiteados; binarios no) |
| Dataset C1 completo | ~200 archivos (5 familias × 40: 100 válidos, 60 con error, 40 escaneados) según fichas |
| Plan y casos de prueba base | `docs/ingenieria/PRUEBAS.md`: 1 caso por RF con su evidencia |

## 4. Actividades específicas

1. Escribir el generador desde las fichas: plantillas en `dataset/plantillas/` (Excel `xlsx`, PDF `pdf-lib`, `.eml`, escaneados por render + degradado 150/300 dpi con Sharp/ImageMagick) + CSV de *ground truth* automático. Terminado: regenera idéntico.
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
- [ ] ~200 archivos con los conteos de las fichas.
- [ ] `PRUEBAS.md` con 1 caso por RF; `bun run verify` verde.

No es done si: hay archivos o CSV a mano; los conteos no cuadran con las fichas.

## 9. Riesgos nombrados

El generador se come la semana. Mitigación: fichas cerradas el 17-oct (sin cambios después salvo issue); desde el 21-oct sin generador corriendo es bloqueo.

## 10. Revisión

Viernes 23-oct con Erik: dataset + plan. Después: #32 resto, #3, #6.

## Versión corta (descripción del issue)

> [61] Generador + dataset — Carlos, 19→23-oct. Sistema con semilla, ~200 archivos, PRUEBAS.md. Requiere fichas #9. Detalle: `docs/briefs/BRIEF-61-generador-dataset.md`.
