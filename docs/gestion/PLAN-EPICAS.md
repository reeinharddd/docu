# Gestión: plan por épicas

Estado: vigente. Fuente de verdad del **estado**: GitHub Issues y Project
(`integraciones/GITHUB-GESTION.md`). Este archivo es la **vista de
planificación**, no el estado. Si discrepan, gana GitHub y se corrige este
archivo. Reconciliación: cada lunes (`RITMO-SEMANAL.md` §Lunes) se compara
este plan con GitHub y se corrige aquí.

## Fechas de la v2 (replanificación del líder, 2026-10-30)

> **C1 modelo y BD: 12 de noviembre de 2026.**
> Milestone `C1 modelo y BD` (#6), issues #58, #60, #62 y #23. Si se mueve, se
> mueve el milestone y se corrige aquí en el mismo PR, con anuncio en el sync.
>
> **C1 vertical completa: 19 de noviembre.** Milestone `C1 vertical completa` (#7).
> **Avances profesor: 24 de noviembre.** Milestone `Avances profesor` (#8).
> **C1 final: 3 de diciembre.** Milestone `C1 final` (#9).
>
> El plan completo está en `gestion/REPLAN-2026-10-30.md`; los hitos son los
> milestones de GitHub, no las fechas de este archivo.

## Reestructuración de alcance (decisión del líder, 2026-10-30)

Lo que se entrega es **más pequeño y está cerrado**, no más grande a medias:

1. **Caso de ejemplo primero.** Se cierra bien el caso de ejemplo
   (Baja SterilPack / C1) y se expone *el problema y cómo se solucionó*,
   entre técnico y relato. Sin extras y sin esperar a tener todo.
2. **Frontend directo a mockups funcionales**, no a pantallas sueltas.
3. **Metas más cortas**, con el caso de ejemplo como criterio de Hecho.
4. **SDD y TDD** (spec antes del código, pruebas primero) para ir más rápido con
   IA sin perder seguridad ni evidencia.

Consecuencia: el trabajo ya no es una cadena de 18 órdenes; son **ocho
carriles en paralelo** (tabla siguiente). El detalle de cada entregable está
en el brief de su issue.

## Orden de ejecución (ocho carriles en paralelo)

Un carril = un brief = un entregable. Los carriles no se ejecutan en cascada:
arrancan cuando su entrada está, y las dependencias reales están registradas
como *blocked by* en GitHub.

| Carril | Qué | Quién | Cierra | Desbloquea | Issues |
|---|---|---|---|---|---|
| A. Caso | Diseño del caso cerrado: personas, flujos, conversaciones, qué falla → cómo se resuelve → por qué afecta, con mapa de derivación | Erik | 6-nov | BD, plataforma, dataset, mockups | #83 |
| B. Plataforma frontend | Estructura atomic, routing, kit, tests y CI | Erik | 10-nov | Frontend del caso | #84 |
| C. Infra IA | Ollama con los modelos, Laya por ONNX, scripts de setup, esqueleto del worker | Erik | 12-nov | Integración IA | sin issue propio (dentro de #85 y #60) |
| D. Base de datos | ER híbrido, DDL + migración, vistas, triggers, append-only, contrato con SHA | Erik | 12-nov | Backend, IA, contrato | #58, #60, #62, #23 |
| E. Integración IA | OCR híbrido, embeddings 768, LLM consultable con citas, búsqueda híbrida | Erik | 18-nov | Freeze, demo | #85 |
| F. Dataset | Generador determinista y emisión del mes (60 turnos × 6 familias) + manifiesto SHA-256 | Carlos | 17-nov | Seed, backend, replicabilidad | #61, #86 |
| G. Backend | Specs y suite desde el 3-nov; implementación: API, ingesta, reglas, cuarentena, oficial, lineage, seed, RBAC, bitácora | Emmanuel | 19-nov | Freeze, demo | #45, #12, #3, #46, #44, #5, #59, #7 |
| H. Frontend | Spec de UI desde el 6-nov; mockups funcionales 13→16-nov; pantallas contra la API real 17→18-nov | Kira | 18-nov | Freeze, demo | #11, #4 |

**Hitos del calendario:** freeze de la vertical **18-nov** · ensayo **20-nov** ·
demo con el profesor **24-nov** · final **3-dic**.

**Reglas de la v2:**

- Nada específico del caso es código: las reglas y el contrato son datos.
- La IA (OCR, embeddings, LLM) entra en C1: sin OCR no hay caso real.
- La demo se prepara y se ensaya antes; si algo falla, hay modo degradado y
  video de respaldo.
- Erik revisa todos los PRs. Un issue `En progreso` por persona.

Cada brief es autocontenido: con opencode + su issue + el Project + las memorias, cualquiera ejecuta sus actividades predefinidas sin contexto previo. Si un brief exige saber de otro para continuar, ahí termina y nace uno nuevo.

## Etapa actual: C1, el caso de ejemplo completo

E1 (refuerzo del repositorio: reglas, entorno, briefs, herramientas del agente)
ya está cerrada. Ahora toca **C1**: el caso de ejemplo (Baja SterilPack) corriendo
de punta a punta, con la IA dentro y con evidencia para las dos presentaciones.

### Glosario de etapas (uso en briefs; confirma el líder)

| Código | Significa | Ejemplo |
|---|---|---|
| E1 | Refuerzo del repositorio (cerrada) | Reglas, entorno, briefs |
| E2 | Worker y pipeline en serio | #3, worker real |
| M1 | Backend/modelo: API, Prisma, validación | #12, #59 |
| K1 | Frontend en construcción | #4, #84 |
| C1/C2 | Configuración 1 (Baja SterilPack) / Configuración 2 (segunda instalación) | #7, #8 |
| S1–S4 | Sprints del calendario canónico | `GITHUB-GESTION.md` |

## Épicas

| Épica (issue) | Sprint | Responsable | Requisitos | Issues |
|---|---|---|---|---|
| Infraestructura (#47) | 2 → 4 | Erik | RF-06, RF-08, RNF-05, RNF-06 | #60, #87, #90, #8 |
| Backend (#48) | 3 | Emmanuel, Erik | RF-01, RF-02, RF-03, RF-05 | #12 (+#44, #45), #3 (+#46), #39 |
| Diseño (#53) | 3 | Kira, Erik | RNF-01 | #11, #84 |
| Frontend (#49) | 3 | Kira | RF-01, RF-03, RF-04 | #4, #84 |
| QA / Documentación (#52) | 2 → 4 | Erik, Carlos | RNF-02, RNF-07 | #61, #86, #83, #88, #89, #6 |
| Autenticación (#51) | 3 | Carlos, Emmanuel | RF-06, RF-02, RNF-03 | #5 |
| Base de datos (#50) | 3 | Erik, Emmanuel | RF-08 | #58, #59, #62, #23, #7 |

## Dependencias (nativas en GitHub, *blocked by*)

Las dependencias de la v2, registradas en GitHub y verificables con
`gh issue view N` (panel *Development*):

| Issue bloqueado | Bloqueado por | Por qué |
|---|---|---|
| #58 ER v1 | #83 Caso | El ER deriva del caso cerrado |
| #60 Arquitectura | #58 | La arquitectura describe el modelo ya decidido |
| #62 Modelo | #58 | El modelo documentado describe el ER ya cerrado |
| #23 Contrato | #62, #61 | El contrato congelado necesita modelo y dataset |
| #59 Seed | #58, #61 | El seed necesita el DDL y los archivos del dataset |
| #44 Solo-insert | #58 | El solo-insert se instala sobre el esquema |
| #45 Pruebas API | #87 SDD/TDD | La puerta TDD necesita el método definido |
| #12 API de ingesta | #45 | La API se construye con la suite primero |
| #3 Pipeline | #12 | El pipeline usa la API de ingesta |
| #46 Worker | #3 | El worker procesa lo que el pipeline encola |
| #5 RBAC | #58 | Los permisos se calculan sobre el modelo |
| #61 Dataset | #83, #58 | El dataset sale del caso y respeta el DDL |
| #84 Plataforma FE | #87 | La plataforma se construye con el método y las guardas |
| #85 IA | #58, #61 | La IA corre sobre el DDL y se mide con el corpus |
| #86 Replicabilidad | #61, #59 | La replicabilidad encadena dataset y seed |
| #7 C1 de punta a punta | #12, #3, #59, #85 | La verificación de punta a punta necesita todo |
| #11 Mockups | #83, #84 | Los mockups salen del caso y de la plataforma |
| #4 Frontend | #11, #12 | Las pantallas reales consumen la API |
| #89 Demo 24-nov | #7, #4, #85 | La demo necesita la vertical completa |
| #6 Demo final | #89 | La final se apoya en la demo de avances |

Dentro del carril D (#60, #62 y #23 bloqueados por #58) las dependencias
expresan el **orden de derivación**, no semanas de espera: el carril se
entrega entero el 12-nov.

El taller de diseño es la rama huérfana `design/kira-playground`: **nunca se
fusiona**. A `main` solo llegan `docs/diseno/*`, `docs/diseno/tokens.json` y
capturas; el código del taller se queda (`BRIEF-11`, `BRIEF-41-fase2`).

## Riesgos

El registro vivo es `gestion/RIESGOS.md`; aquí no se duplica para no divergir.
Si un riesgo cambia, se actualiza ahí y se anuncia en el sync.
