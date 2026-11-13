# BRIEF #138 — Skills de análisis de calidad: frontend y backend

## 0. Encabezado

- Issue: #138
- Dueño: Erik Beltrán (Líder, infra y pipeline).
- Fechas: 2026-11-13 → 2026-11-14 · Sprint 3 · hito `C1 vertical completa` (20-nov)
- Prioridad / Tipo / Épica / Módulo: media / tarea / QA-Documentación / harness.
- Requisitos: RNF-05, RNF-07
- Bloqueado por: — · Bloquea a: #106 (revisión de carriles)

## 1. Contexto

El harness tiene las herramientas para **hacer** código (`docu-frontend`,
`pp-code-reviewer`, las skills de ECC) pero ninguna para **juzgar** si lo que
se hizo es bueno, y mucho menos con el vocabulario del caso: legibilidad,
función y fluidez en el frontend; velocidad, coordinación y ejecución en el
backend.

Los repos starred del líder ya tienen las piezas: `addyosmani/agent-skills`
(116 840 estrellas) trae `frontend-ui-engineering`, `performance-optimization`
y `observability-and-instrumentation`; `waybarrios/opencode-power-pack` (555)
trae `ai-slop`, la rúbrica operativa para juzgar si una interfaz es genérica.
Todas son MIT y todas se pueden vendorizar con pin (ADR-0013).

## 2. Por qué importa tu parte

El proyecto tiene una fecha de entrega encima (15-nov) y tres personas
trabajando en paralelo. El cuello de botella no es escribir pantallas: es
**revisarlas con criterio antes de que lleguen a `main`**. Sin una rúbrica,
cada revisión es opinión, y las opinions no se pueden discutir ni repetir.

Esta entrega deja el juicio de calidad como **herramienta del harness**: la
misma rúbrica, los mismos umbrales y la misma exigencia de evidencia para
todo el equipo, sin depender de quién revise.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| 4 skills vendorizadas con pin | `.opencode/skills/vendor/ao-frontend-ui-engineering/`, `ao-performance-optimization/`, `ao-observability-and-instrumentation/`, `pp-ai-slop/`; cada `SKILL.md` con `metadata.repo`, `metadata.commit`, `metadata.version` y `metadata.adaptacion` |
| Checklists replicated donde se citan | `references/` dentro de cada skill; ningún link relativo sale de su directorio |
| Skill propia que enruta y exige evidencia | `.opencode/skills/docu-analisis-calidad/SKILL.md`: los 7 ejes, qué skill carga cada uno, qué es un hallazgo (eje, dónde, evidencia, impacto, severidad) y qué NO se hace |
| Catálogo vivo actualizado | `docs/integraciones/CAPACIDADES.md` con las 5 filas nuevas; `.opencode/skills/vendor/UPSTREAMS.json` con los 4 pins |
| Harness verificable | `bun run harness:check` en verde (22 piezas, 0 hallazgos) |

## 4. Actividades específicas

1. Vendorizar con pin y metadata las 4 skills candidatas de los repos starred.
   Terminado: 4 skills, 4 pins, checklists replicados y links reescritos.
2. Escribir la skill propia que dice qué skill carga cada eje y qué evidencia
   exige un hallazgo. Terminado: `docu-analisis-calidad`, con los 7 ejes
   (legibilidad, función, fluidez, estilo visual, velocidad, coordinación,
   ejecución), las reglas de `apps/web` y de `apps/api` y el contrato de salida.
3. Actualizar el catálogo vivo (`CAPACIDADES.md`) y los pins (`UPSTREAMS.json`).
   Terminado: 5 filas y 4 pins; `harness-check` cruza catálogo y disco.
4. Verificar que el harness sigue en verde. Terminado: `harness: 22 pieces, 0 findings`.

## 5. Entradas y salidas

- Recibe: los repos starred del líder (`gh api user/starred`), el catálogo vivo
  del harness (`docs/integraciones/CAPACIDADES.md`) y el runbook de evolución
  (`docs/HARNESS.md` §5).
- Entrega: el juicio de calidad como pieza del harness, con su regla de
  evidencia y su catálogo al día.

## 6. Referencias y caja de herramientas (tú eliges cuáles usar)

Principio: contexto y criterio, no código hecho.

- `docs/HARNESS.md` §5 — el runbook de alta de una skill (metadata + fila en
  `CAPACIDADES.md` + `harness-check` en verde).
- `docs/integraciones/CAPACIDADES.md` — el índice vivo; si una pieza falta ahí,
  gana el archivo y se corrige el índice.
- `scripts/harness-check.sh` — qué exige exactamente la metadata.
- ADR-0013 — el harness vive en el repositorio; `UPSTREAMS.json` fija la
  procedencia de lo vendorizado.
- Upstream: `addyosmani/agent-skills` (MIT), `waybarrios/opencode-power-pack` (MIT).

Lo que NO se limitamos: el texto de las skills adaptadas, el número de skills
vendorizadas, el formato de la metadata. Lo que sí se devuelve: una skill sin
`owner`/`trigger`/`purpose`, una procedencia sin pin, un link relativo que
sale de su directorio, o un hallazgo de calidad sin evidencia.

## 7. Cómo trabajar

- Rama `feat/138-skills-analisis-calidad` desde `main`.
- Las skills vendorizadas se **adaptan**, no se copian a ciegas: la metadata
  `adaptacion` dice qué angle se le da en DOCU.
- El contenido que consume el agente va en inglés (regla de `AGENTS.md`); los
  documentos de `docs/` en español.

## 8. Criterios de aceptación

- [x] 4 skills vendorizadas con pin en `UPSTREAMS.json` y `metadata` completa.
- [x] Los checklists que las skills citan están replicados dentro de su
      directorio; ningún link relativo sale de él.
- [x] `docu-analisis-calidad` enruta cada eje a su skill y exige evidencia.
- [x] `CAPACIDADES.md` lista las 5 piezas nuevas; `harness-check` en verde.
- [x] `bun run lint`, `bun run typecheck` y las guardas de docs en verde.
