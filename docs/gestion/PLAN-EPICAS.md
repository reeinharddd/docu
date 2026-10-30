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

## Orden de ejecución (un brief = un entregable)

| Orden | Qué | Quién | Cierra | Desbloquea | Estado |
|---|---|---|---|---|---|
| 1 | Tablero y gestión (#43) | Erik | 13-oct | ritmo | Hecho |
| 2 | Esenciales: entorno, reglas, agentes, CI (#10) | Erik | 13-oct | todo el equipo | Hecho (#10 cerrado 2026-10-17) |
| 3 | Marca + elección (#41-fase1) | Kira | 13-oct | fase2, #11 | Hecho (2026-10-29: PDF de exploración + acta de marca en `docs/diseno/`) |
| 4 | SRS + firma (#13, #30) | Erik | 13-oct | entregas | Hecho |
| 5 | Matriz y perfiles (#29) | Carlos | 16-oct | #5, #9 | Hecho |
| 6 | Diagrama v0 afirmado (#58) | Emmanuel | 16-oct | #59 | **Pendiente: no iniciado** |
| 7 | Tokens + flujo unificados (#41-fase2, #11) | Kira | 23-oct | #4 | Tokens entregados (#41-fase2, 2026-10-29); #11 desbloqueado, sigue en el taller `design/kira-playground` |
| 8 | Diseño de documentos (#9) | Carlos | 19-oct | #61 | Hecho |
| 9 | Generador + dataset + plan (#61) | Carlos | 23-oct | #32 resto, #3 | Pendiente |
| 10 | v1 + seed (#59) | Emmanuel | 23-oct | #7, #60 | Pendiente |
| 11 | Arquitectura (#60) | Erik | 23-oct | #12 | Pendiente |
| 12 | Modelo documentado (#62) | Erik | 23-oct | #12, #3 | Pendiente |
| 13 | OCR spike + fase 2 (#32) | Erik | 23-oct | #3 | Hecho (evaluación OCR, #32 cerrado) |
| 14 | Verificación con carga (#7) | Emmanuel | 30-oct | #8, #23 | Pendiente |
| 15 | Frontend completo (#4) | Kira | 20-nov | demo | Pendiente |
| 16 | API esqueleto (#12-A) | Emmanuel | 27-oct | #5 | Pendiente |
| 17 | RBAC en servidor (#5) | Carlos+Emmanuel | 06-nov | #4, #39 | Pendiente |
| 18 | Pipeline (#3) | Erik | 13-nov | demo | Pendiente |

**Siguiente en la fila:** el **modelado de la base de datos** (C1). Arranca por
#58 (diagrama v0 afirmado) → #59 (v1 + seed) → #60 (arquitectura) y #62 (modelo
documentado). Puerta de ADR-0012: nada de producto hasta cerrar estas filas.

Cada brief es autocontenido: con opencode + su issue + el Project + las memorias, cualquiera ejecuta sus actividades predefinidas sin contexto previo. Si un brief exige saber de otro para continuar, ahí termina y nace uno nuevo.

## Etapa actual: E1, refuerzo del repositorio

Hasta tener un design system de marca y los insumos del modelo de datos, **no se
construye frontend, backend ni base de datos**. E1 deja listos reglas,
conocimiento, herramientas del agente, memoria y gestión para que el equipo
trabaje sin depender de una sola persona.

### Glosario de etapas (uso en briefs; confirma el líder)

| Código | Significa | Ejemplo |
|---|---|---|
| E1 | Refuerzo del repositorio (esta etapa) | Reglas, entorno, briefs |
| E2 | Worker y pipeline en serio | #3, worker real |
| M1 | Backend/modelo: API, Prisma, validación | #12, #59 |
| K1 | Frontend en construcción | #4, #41 |
| C1/C2 | Configuración 1 (Baja SterilPack) / Configuración 2 (segunda instalación) | #7, #8 |
| S1–S4 | Sprints del calendario canónico | `GITHUB-GESTION.md` |

## Épicas

| Épica (issue) | Sprint | Responsable | Requisitos | Issues |
|---|---|---|---|---|
| Infraestructura (#47) | 1 → 3 | Erik | RF-06, RF-08, RNF-05, RNF-06 | #10 (hecho), #60, #8, #74 (hecho) |
| Backend (#48) | 1 → 3 | Emmanuel, Erik | RF-01, RF-02, RF-03, RF-05 | #12 (+#44, #45), #3 (+#46), #32, #39 |
| Diseño (#53) | 1 → 2 | Kira, Erik | RNF-01 | #11 (Kira, desbloqueado tras #41); #41 (hecho 2026-10-29); #42 (Erik, hecho) |
| Frontend (#49) | 2 → 3 | Kira | RF-01, RF-03, RF-04 | #4 |
| QA / Documentación (#52) | 1 → 4 | Erik, Carlos | RNF-02, RNF-07 | #9, #13, #30, #61, #6, entregas |
| Autenticación (#51) | 1 → 2 | Carlos, Emmanuel | RF-06, RF-02, RNF-03 | #29, #5 |
| Base de datos (#50) | 1 → 2 | Emmanuel | RF-08 | #58, #59, #7 |

## Dependencias (nativas en GitHub, *blocked by*)

| Issue bloqueado | Bloqueado por | Por qué |
|---|---|---|
| #12 API, #3 Pipeline, #5 RBAC, #7 Configuración 1 | #10 Arquitectura y entorno | Sin `pgvector` no hay `vector`, sin BD no hay ingesta |
| #4 Frontend | #23 Contrato de datos congelado | La maqueta consume el contrato, no la BD |
| #4 Frontend | #3 Pde ingesta | La API entrega el dato que la pantalla cita |
| #3 Pipeline | #7 Configuración 1 | Ordena, lee y valida por familia |
| #8 Configuración 2 | #7 Configuración 1 | La 2 se prueba sobre datos de la 1 |
| #3 Pipeline | #32 Evaluación OCR | RF-02 exige ≥ 90 %: se mide antes de implementar |
| #39 Reporte y alerta | #3 Pipeline | El reporte lee datos ya ingeridos |
| #41 Design system | #42 Playground | Hecho: el taller ya existe (`design/kira-playground`) |
| #11 Prototipos | #41 Design system | Los mockups usan tokens y componentes aprobados |
| #4 Frontend | #41 Design system | Puerta 1 de ADR-0012 |

El taller de diseño es la rama huérfana `design/kira-playground`: **nunca se
fusiona**. A `main` solo llegan `docs/diseno/*`, `docs/diseno/tokens.json` y
capturas; el código del taller se queda (`BRIEF-11`, `BRIEF-41-fase2`).

La construcción de producto espera dos puertas: design system de marca y modelo
de datos validado (ADR-0012).

## Riesgos

El registro vivo es `gestion/RIESGOS.md`; aquí no se duplica para no divergir.
Si un riesgo cambia, se actualiza ahí y se anuncia en el sync.
