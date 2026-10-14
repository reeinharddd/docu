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

| Orden | Qué | Quién | Cierra | Desbloquea |
|---|---|---|---|---|
| 1 | Tablero y gestión (#43) | Erik | 13-oct | ritmo |
| 2 | Esenciales: entorno, reglas, agentes, CI (#10) | Erik | 13-oct | todo el equipo |
| 3 | Marca + elección (#41-fase1) | Kira | 13-oct | fase2, #11 |
| 4 | SRS + firma + casos de uso (#13, #30, #36) | Erik | 13-oct | entregas |
| 5 | Matriz y perfiles (#29) | Carlos | 16-oct | #5, #9 |
| 6 | Diagrama v0 afirmado (#58) | Emmanuel | 16-oct | #59 |
| 7 | Tokens + flujo unificados (#41-fase2, #11) | Kira | 23-oct | #4 |
| 8 | Diseño de documentos (#9) | Carlos | 19-oct | #61 |
| 9 | Generador + dataset + plan (#61) | Carlos | 23-oct | #32 resto, #3 |
| 10 | v1 + seed (#59) | Emmanuel | 23-oct | #7, #60 |
| 11 | Arquitectura (#60) | Erik | 16-oct | #12 |
| 12 | Modelo documentado (#62) | Erik | 23-oct | #12, #3 |
| 13 | OCR spike + fase 2 (#32) | Erik | 23-oct | #3 |
| 14 | Verificación con carga (#7) | Emmanuel | 30-oct | #8, #23 |
| 15 | Frontend completo (#4) | Kira | 20-nov | demo |
| 16 | API esqueleto (#12-A) | Emmanuel | 27-oct | #5 |
| 17 | RBAC en servidor (#5) | Carlos+Emmanuel | 06-nov | #4, #39 |
| 18 | Pipeline (#3) | Erik | 13-nov | demo |

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
| C1/C2 | Configuración 1 (Baja SterilPack) / Configuración 2 (segunda planta) | #7, #8 |
| S1–S4 | Sprints del calendario canónico | `GITHUB-GESTION.md` |

## Épicas

| Épica (issue) | Sprint | Responsable | Requisitos | Issues |
|---|---|---|---|---|
| Infraestructura (#47) | 1 → 3 | Erik | RF-06, RF-08, RNF-05, RNF-06 | #10 (en progreso), #60, #43, #8, #31, #33 |
| Backend (#48) | 1 → 3 | Emmanuel, Erik | RF-01, RF-02, RF-03, RF-05 | #12 (+#44, #45), #3 (+#46), #32, #39 |
| Diseño (#53) | 1 → 2 | Kira, Erik | RNF-01 | #11 (absorbió #28 el 13-oct), #42, #41 |
| Frontend (#49) | 2 → 3 | Kira | RF-01, RF-03, RF-04 | #4 |
| QA / Documentación (#52) | 1 → 4 | Erik, Carlos | RNF-02, RNF-07 | #9, #13, #30, #36, #6, entregas |
| Autenticación (#51) | 1 → 2 | Carlos, Emmanuel | RF-06, RF-02, RNF-03 | #29, #5 |
| Base de datos (#50) | 1 → 2 | Emmanuel | RF-08 | #58, #59, #7 |

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
| OCR no alcanza el 90 % en scans del caso | #32 fase 2 sin resultados al 2026-10-23 (Erik) | Spike fase 1 con genéricos 16-oct; confirma o recorta |
| Sprint 1 termina el 23-oct y el contrato es 30-oct flexible | #60 o #62 abiertos al 2026-10-23 | Si el diseño se retrasa, el líder replanifica en sync (no solo Markdown) |
| #29 retrasa matriz | Sin `ROLES.md` al 2026-10-16 (Carlos) | Alcance recortado a matriz; dataset es #9/#61 |
| #39 y #36 sin responsable | `gh issue list --search no:assignee` | **Cerrado 2026-10-12**: #36 → Erik, #39 → Emmanuel (sync lunes; assignee en GitHub pendiente a que existan las cuentas) |
| Marca Fase 1 cierra el 13-oct | #41-fase1, Kira | Es la primera fecha que vence; bloquea fase2 |
| Prototipos UI/UX cierran el 23-oct | #11, Kira | Tras la marca, alimenta #4 y #23 |
| Frontend sin design system de marca | #41 abierto al 2026-10-30 | Playground (#42) usable desde el 2026-10-13 |
