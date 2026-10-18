# ADR 0015 — El harness tiene un core: conocimiento y cumplimiento verificables

Fecha: 2026-10-17 · Estado: Aceptada · Decide: Erik · Revisa: el equipo

## Contexto

ADR-0007 fijó el principio (el contrato del agente y sus herramientas son parte
del repo, cada uno con dueño y propósito) y ADR-0013 fijó su implementación
concreta (opencode, superpowers, Engram, comandos, skills, subagentes, MCP). El
harness existe y está versionado, pero le falta la capa que lo **ata** y lo hace
**cumplir**. Cuatro huecos concretos:

1. No hay un mapa único del "cómo trabajamos": el conocimiento está repartido en
   `README`, `REGLAS`, `ADR-0001/0007/0013`, `RITMO`, `GITHUB-GESTION`, `EQUIPO`
   y `HERRAMIENTAS-AGENTE`, sin una vista que los ate.
2. ADR-0007 §6 exige que cada herramienta declare dueño y propósito en un
   archivo de índice; ese índice no existe y **ninguna** skill, comando,
   subagente o MCP declara dueño. La propiedad está definida para personas, no
   para herramientas.
3. No hay runbook de evolución del harness (alta, baja, bump de pin,
   deprecación): son reglas sueltas.
4. La paridad multi-cliente no está resuelta, y lo que "debe valer siempre" no
   se verifica en un lugar único.

## Decisión

**El harness tiene un core con dos capas: conocimiento (que se sepa todo) y
cumplimiento (que no se pueda hacer mal), verificable en CI.** Concretos:

1. **Mapa y catálogo.** `docs/HARNESS.md` es el mapa (rol→flujo→herramienta→
   dueño→cadencia, los dos ciclos, los puntos de autoridad y el runbook de
   evolución). `docs/integraciones/CAPACIDADES.md` es el índice vivo de
   herramientas. A ambos apunta la iniciación (`AGENTS.md`, `docs/README.md`).
2. **Metadata viva.** Cada pieza del harness (comando, subagente, skill propia o
   vendorizada) declara en su frontmatter `dueno`, `disparador` y `proposito`;
   las vendorizadas, además, su procedencia (`metadata.repo/commit/version`, ya
   existente).
3. **Verificación.** `scripts/harness-check.sh` cruza la metadata contra
   `EQUIPO.md` y el catálogo contra el disco, y **falla** si algo falta o
   sobra. Corre en `bun run verify`, en `bun run doctor` y en CI.
4. **Cumplimiento a la par.** Lo que debe valer siempre se exige en CI (script
   client-agnóstico) **y** en el cliente (comandos `/inicio` y `/cerrar`).
5. **Paridad multi-cliente = puente.** opencode es oficial; para otros clientes
   no se replican comandos ni skills (ADR-0007 lo prohíbe); `CLAUDE.md`/
   `AGENTS.md` son el puente y lo exigible vive en CI.
6. **Barrido puntual.** El catálogo de candidatos (stars, bookmarks, online) es
   un documento que se escribe una vez y se evalúa con los siete criterios de
   `HERRAMIENTAS-AGENTE.md`; no se adopta nada en automático.
7. **Enfoque A, B como upgrade.** La fuente es el documento más la metadata
   (enfoque A), reusando el mecanismo del índice verificable (`docs/.indice`). Un
   `harness.manifest.json` que genere los documentos (enfoque B) queda como
   upgrade opcional, sin reescribir nada.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| B — `harness.manifest.json` como fuente única que genera los documentos | Drift-cero por construcción, pero introduce "generar docs" al repo, que choca con el modelo vigente (el documento manda) y suma curva al equipo. Se conserva como upgrade futuro; la metadata de §Decisión 2 lo hace migrable. |
| C — un solo `HARNESS.md`, sin metadata verificable | Rápido, pero el dueño/trigger no queda verificable por máquina y el documento se desincroniza solo. No cumple ADR-0007 §6. |
| Cumplimiento solo en CI | Simple y client-agnóstico, pero deja al agente sin guía en el momento de actuar. |
| Cumplimiento solo en el cliente (opencode) | Fuerte dentro de opencode, pero quien use otro cliente o la terminal se salta parte. |
| Replicar comandos y skills para Claude Code/Codex | Duplicación y drift, justo lo que ADR-0007 prohíbe. |

## Consecuencias

- **A favor**: cualquiera (persona o agente) resuelve una tarea sin preguntar
  dónde está cada cosa; el mapa y el catálogo son el punto de entrada.
- **A favor**: la propiedad de las herramientas deja de ser tácita: cada pieza
  declara su dueño y CI lo exige.
- **A favor**: el harness no puede quedar inconsistente en silencio: índice,
  metadata y dueños se verifican en cada PR.
- **En contra**: mantener la metadata viva es trabajo; se acepta a cambio de la
  verificación. Una pieza nueva sin metadata **falla** el PR.
- **Riesgo residual**: el doble enforcement puede sentirse pesado. Se mitiga
  exigiendo solo lo que importa (metadata, índices, links, formato) y dejando el
  resto como guía.

## Estado de implementación

| Pieza | Ubicación | Estado |
|---|---|---|
| Mapa | `docs/HARNESS.md` | **Hecho** |
| Catálogo vivo | `docs/integraciones/CAPACIDADES.md` | **Hecho** |
| Metadata viva | frontmatter de las 15 piezas del harness | **Hecho** |
| Verificador | `scripts/harness-check.sh` | **Hecho** |
| Enforcement CI + verify/doctor | `.github/workflows/ci.yml`, `package.json`, `scripts/doctor.sh` | **Hecho** |
| Enforcement cliente | `/inicio`, `/cerrar` | **Hecho** |
| Barrido puntual | `docs/integraciones/CATALOGO-<fecha>.md` | En curso |
| Upgrade B (manifest) | — | No planificado |

## Evidencia

- Diseño e implementación: `docs/superpowers/specs/2026-10-17-harness-core-design.md`
  y `docs/superpowers/plans/2026-10-17-harness-core.md`.
- `bash scripts/harness-check.sh` → `harness: 15 piezas, 0 hallazgos`.
- `bash scripts/doc-index.sh` → sin discrepancias; `bun run verify` en verde.

## Qué nos haría revertirla

Si la metadata se vuelve un impuesto que el equipo empieza a saltarse (piezas sin
dueño, checks desactivados), o si el costo de mantener `HARNESS.md` y
`CAPACIDADES.md` supera lo que ahorran. En ese caso se colapsa a la alternativa
C o se migra a B (manifest que genere los documentos), sin reescribir esta ADR.
