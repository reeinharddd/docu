# Gestión: plan por épicas

Estado: vigente. Fuente de verdad del **estado**: GitHub Issues y Project
(`integraciones/GITHUB-GESTION.md`). Este archivo es la **vista de
planificación**, no el estado. Si discrepan, gana GitHub y se corrige este
archivo.

## Fecha dura

> **Contrato de datos congelado el 23 de octubre de 2026 para las maquetas.**
> Milestone `Contrato de datos congelado` e issue #23. Si se mueve, se mueve el
> milestone y se corrige aquí en el mismo PR.

## Etapa actual: E1, refuerzo del repositorio

Hasta tener un design system de marca y los insumos del modelo de datos, **no se
construye frontend, backend ni base de datos**. E1 deja listos reglas,
conocimiento, herramientas del agente, memoria y gestión para que el equipo
trabaje sin depender de una sola persona.

## Épicas

| Épica | Sprint | Responsable | Requisitos | Issues |
|---|---|---|---|---|
| Infraestructura | 1 | Erik | RF-06, RNF-05, RNF-06 | #10 (en progreso), #8 |
| Backend | 1 → 2 | Emmanuel | RF-01, RF-02, RF-03 | #12, #3 |
| Frontend | 1 → 2 | Kira | RNF-01 → RF-01, RF-03, RF-04 | #11, #4 |
| QA / Documentación | 1 → 4 | Erik, Carlos | RNF-07 | #9, #13, #6 |
| Autenticación | 2 | Emmanuel | RF-06, RF-02 | #5 |
| Base de datos | 2 | Carlos | pendiente | #7 |

## Dependencias (nativas en GitHub, *blocked by*)

| Issue bloqueado | Bloqueado por | Por qué |
|---|---|---|
| #12 API, #3 Pipeline, #5 RBAC, #7 Configuración 1 | #10 Arquitectura y entorno | Sin `pgvector` no hay `vector`, sin BD no hay ingesta |
| #4 Frontend | #23 Contrato de datos congelado | La maqueta consume el contrato, no la BD |
| #4 Frontend | #3 Pipeline de ingesta | La API entrega el dato que la pantalla cita |
| #3 Pipeline | #7 Configuración 1 | Ordena, lee y valida por familia |
| #8 Configuración 2 | #7 Configuración 1 | La 2 se prueba sobre datos de la 1 |

Sin issue todavía: **OCR evaluado** antes de RF-01/RF-02 (RF-02 exige ≥ 90 % con
CER ≤ 10 % en escaneados reales).

## Riesgos

| Riesgo | Señal | Mitigación |
|---|---|---|
| OCR no alcanza el 90 % en escaneados | RF-02 en Sprint 2 sin issue de evaluación | Evaluar OCR antes de implementar |
| Sprint 1 termina el 16-oct y el contrato se congela el 23-oct | #10 y #13 cierran el 16 | Si el diseño se retrasa, la congelación no se cumple |
| 3 issues con `req:pendiente` y RF-05 sin issue | `gh issue list --label req:pendiente` | `gestion/TRAZABILIDAD.md` |
| Prototipos UI/UX cierran el 9-oct | #11, Kira | Es la primera fecha que vence |
| Frontend sin design system de marca | 0 dependencias de UI en `apps/web` | Playground de diseño de Kira, después de cerrar E1 |
