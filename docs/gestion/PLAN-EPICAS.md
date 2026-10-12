# Gestión: plan por épicas

Estado: vigente. Fuente de verdad del **estado**: GitHub Issues y Project
(`integraciones/GITHUB-GESTION.md`). Este archivo es la **vista de
planificación**, no el estado. Si discrepan, gana GitHub y se corrige este
archivo. Reconciliación: cada lunes (`RITMO-SEMANAL.md` §Lunes) se compara
este plan con GitHub y se corrige aquí.

## Fecha objetivo (flexible por decisión del líder 2026-10-12)

> **Contrato de datos: objetivo 30 de octubre de 2026 para las maquetas.**
> Milestone `Contrato de datos congelado` e issue #23. Si se mueve, se mueve el
> milestone y se corrige aquí en el mismo PR, con anuncio en el sync.
>
> Replanificación 2026-10-09: inicio 2026-10-05 → 2026-10-12 (+7 días).

## Etapa actual: E1, refuerzo del repositorio

Hasta tener un design system de marca y los insumos del modelo de datos, **no se
construye frontend, backend ni base de datos**. E1 deja listos reglas,
conocimiento, herramientas del agente, memoria y gestión para que el equipo
trabaje sin depender de una sola persona.

## Épicas

| Épica (issue) | Sprint | Responsable | Requisitos | Issues |
|---|---|---|---|---|
| Infraestructura (#47) | 1 → 3 | Erik | RF-06, RF-08, RNF-05, RNF-06 | #10 (en progreso), #43, #8, #31, #33 |
| Backend (#48) | 1 → 3 | Emmanuel, Erik | RF-01, RF-02, RF-03, RF-05 | #12 (+#44, #45), #3 (+#46), #32, #39 |
| Diseño (#53) | 1 → 2 | Kira, Erik | RNF-01 | #11, #28, #42, #41 |
| Frontend (#49) | 2 → 3 | Kira | RF-01, RF-03, RF-04 | #4 |
| QA / Documentación (#52) | 1 → 4 | Erik, Carlos | RNF-02, RNF-07 | #9, #13, #30, #36, #6, entregas |
| Autenticación (#51) | 1 → 2 | Carlos, Emmanuel | RF-06, RF-02, RNF-03 | #29, #5 |
| Base de datos (#50) | 2 | Emmanuel | RF-08 | #7 |

## Dependencias (nativas en GitHub, *blocked by*)

| Issue bloqueado | Bloqueado por | Por qué |
|---|---|---|
| #12 API, #3 Pipeline, #5 RBAC, #7 Configuración 1 | #10 Arquitectura y entorno | Sin `pgvector` no hay `vector`, sin BD no hay ingesta |
| #4 Frontend | #23 Contrato de datos congelado | La maqueta consume el contrato, no la BD |
| #4 Frontend | #3 Pipeline de ingesta | La API entrega el dato que la pantalla cita |
| #3 Pipeline | #7 Configuración 1 | Ordena, lee y valida por familia |
| #8 Configuración 2 | #7 Configuración 1 | La 2 se prueba sobre datos de la 1 |
| #3 Pipeline | #32 Evaluación OCR | RF-02 exige ≥ 90 %: se mide antes de implementar |
| #39 Reporte y alerta | #3 Pipeline | El reporte lee datos ya ingeridos |
| #41 Design system | #42 Playground | El design system se explora en el playground |
| #4 Frontend | #41 Design system | Puerta 1 de ADR-0012 |

La construcción de producto espera dos puertas: design system de marca y modelo
de datos validado (ADR-0012).

## Riesgos

| Riesgo | Señal | Mitigación |
|---|---|---|
| OCR no alcanza el 90 % en escaneados | #32 sin resultados al 2026-10-19 (Erik) | Brief `briefs/BRIEF-32-evaluacion-ocr.md` |
| Sprint 1 termina el 23-oct y el contrato se congela el 30-oct | #10 y #13 cierran el 23 | Si el diseño se retrasa, la congelación no se cumple |
| #29 Matriz de roles vencida (30-sep) | Bloquea el contrato de datos, cierre antes del 2026-10-16 (Carlos) | Brief `briefs/BRIEF-29-matriz-roles-y-dataset.md` |
| #39 y #36 sin responsable | `gh issue list --search no:assignee` | **Cerrado 2026-10-12**: #36 → Erik, #39 → Emmanuel (sync lunes; assignee en GitHub pendiente a que existan las cuentas) |
| Marca Fase 1 cierra el 16-oct | #41-fase1, Kira | Es la primera fecha que vence; bloquea #41 |
| Prototipos UI/UX cierran el 23-oct | #11, Kira | Tras la marca, alimenta #4 y #23 |
| Frontend sin design system de marca | #41 abierto al 2026-10-30 | Playground (#42) listo desde el 2026-10-16 |
