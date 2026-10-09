# BRIEF #7 — Configuración 1: carga de familias de la planta (sin código)

## 0. Encabezado

- Issue: #7
- Dueño: Emmanuel (replanificación 2026-10-09: Carlos → Emmanuel)
- Fechas: 2026-10-19 → **2026-10-30** · Sprint 2 · hito `Contrato de datos congelado` (2026-10-30)
- Prioridad / Tipo / Épica / Módulo: media / historia / Base de datos / base de datos
- Requisitos: RF-08 (parametrización sin código)
- Bloqueado por: #10 entorno, #29 matriz, #9 dataset · Bloquea a: #8 Configuración 2, #3 Pipeline

## 1. Contexto

RF-08 exige parametrizar por empresa sin cambiar código: catálogos, familias, roles, umbrales. La Configuración 1 (Baja SterilPack) es la prueba: 4 familias (F-ORDEN, F-ROLLO-RECEPCIÓN, F-INVENTARIO, F-PROGRAMA) con esquemas, reglas R-P1..T1, roles y umbrales solo como datos.

## 2. Por qué importa tu parte

Backend construye sobre esto (#12, #3). Si C1 no carga (ingesta → validación → cuarentena → 1 reporte), el pipeline no tiene sobre qué correr y la Configuración 2 no puede demostrar generalidad. Si sale bien, el 30-oct el contrato se congela con datos reales.

## 3. Objetivo y resultado esperado

C1 cargada solo con datos, con 1 reporte funcionando.

| Entregable | Evidencia |
|---|---|
| Familias + esquemas + reglas + roles + umbrales | Seed/config versionado; `git diff` de código vacío salvo datos |
| Flujo ingesta → validación → cuarentena | Corrida con CSV: válidos pasan, inválidos a cuarentena con motivo (R-P1..T1) |
| 1 reporte funcionando sobre C1 | Salida del reporte + captura en el PR |
| Precede a C2 | Nota en #8 de qué reutiliza |

## 4. Actividades específicas

1. Recibir de Erik (#10) entorno + migración y de Carlos (#29/#9) matriz + dataset (2 h). Terminado: checklist de insumos.
2. Cargar familias y reglas como datos (6 h): esquemas por familia, `ReglaValidacion` con severidad BLOQUEO/AVISO, roles y umbrales. Terminado: seed reproducible con semilla.
3. Probar cadena (3 h): ingesta → validación en cadena → cuarentena o dato oficial. Terminado: CSV de corrida + 1 caso por regla R-P1..T1.
4. Sacar 1 reporte (3 h): el reporte mínimo de C1. Terminado: salida adjunta al PR.
5. Documentar qué es dato y qué sería código (1 h). Terminado: nota para #8.

Total estimado: 14–16 h.

## 5. Entradas y salidas

- Recibe: entorno de Erik (#10), matriz de Carlos (#29), dataset de Carlos (#9).
- Entrega: a Erik (#3 pipeline) y a #8 (C2), por PR, C1 cargada + reporte. Comenta en #3 y #8.

## 6. Referencias y caja de herramientas

- `CASO.md` (reglas R-P1..T1, familias), `REQUISITOS.md` RF-08 + evidencias, `MODELO-DATOS.md` (ADR-0009 reglas como datos, ADR-0010 solo-INSERT).
- `VISION.md` principio 7: C2 con `git diff` vacío.
- Comandos: `bunx prisma migrate dev` desde `apps/api`, `bun run verify`.

Recursos oficiales para implementar:

| Para | Recurso | Cuándo usarlo |
|---|---|---|
| Seed reproducible | https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding | Al escribir el seed de C1 (idempotente, con semilla) |
| PostgreSQL + `vector` | https://www.postgresql.org/docs/18/ + https://github.com/pgvector/pgvector | Al cargar catálogos y validar tipos |
| Reglas como datos | ADR-0009 + `MODELO-DATOS.md` (`ReglaValidacion`, severidad BLOQUEO/AVISO) | Al cargar R-P1..T1 sin `if` en código |
| Probar SQL sin local | De tus bookmarks: https://postgres.new (PostgreSQL en el navegador) | Al validar el seed y los JSONB antes de migrar |
| Ver el seed como grafo | De tus bookmarks: https://jsoncrack.com | Al depurar familias/reglas anidadas |

## 7. Cómo trabajar

- EMMANUEL NO DEBE: tocar código de producto para meter una familia (eso viola RF-08); importar providers con `import type` en `apps/api` (rompe DI por `emitDecoratorMetadata`).
- EMMANUEL SÍ DEBE: todo con semilla/versión; cuarentena con motivo visible; `.env` fuera del repo.
- `/tarea 7` y `/cerrar`; 1 issue En progreso; bloqueo >24 h con `bloqueado`.

## 8. Criterios de aceptación

- [ ] C1 carga con `git diff` de código vacío (solo datos).
- [ ] Cada regla R-P1..T1 tiene 1 caso que pasa o va a cuarentena con motivo.
- [ ] 1 reporte sale sobre C1 (salida adjunta).
- [ ] `bun run verify` en verde; PR con `Closes #7`.

No es done si: una familia exigió parche de código; un inválido se borró en silencio.

## 9. Riesgos nombrados

Nomenclatura de reglas duplicada (`CASO.md` pendiente R-S1/R-T1 vs R-P1..). Mitigación: cerrar con el equipo antes de M1; desde el 2026-10-23 sin decisión es bloqueo (afecta seed y validación).

## 10. Revisión

Viernes 2026-10-30 con Erik (pipeline) y Carlos (dataset): demo de carga + reporte. Después: #8 Configuración 2.
