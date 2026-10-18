# Harness de DOCU: cómo trabajamos con agentes

Estado: vigente. Última actualización: 2026-10-17. Dueño: Erik (`reeinharddd`).

Este es el **mapa del harness**: la vista única de cómo se trabaja en DOCU, con
agentes o a mano. No reescribe los documentos vigentes: los ata. Su compañero es
`integraciones/CAPACIDADES.md` (qué herramienta existe y de quién es cada una).

## 1. Qué es y cómo usarlo

Dos lecturas del mismo mapa:

- **Humano (onboarding).** Lee §2 para saber tu rol, tu flujo y tus herramientas;
  §3 para ubicar la etapa; §5 para cambiar algo del harness.
- **Agente (antes de actuar).** Lee §2 y §4. La **regla de oro**: si no está en
  este mapa o en `docs/.indice`, no existe; si contradice un documento del repo,
  gana el repo y lo señalas.

Entradas canónicas: `docs/README.md` (ley documental), `docs/REGLAS.md`,
`ADR-0001` (flujos del agente), `ADR-0007` (contrato de herramientas),
`ADR-0013` (opencode oficial, superpowers, Engram), `proyecto/EQUIPO.md`
(personas), `integraciones/CAPACIDADES.md` (herramientas).

## 2. Rol → flujo → herramienta → dueño → cadencia

### Personas

| Persona | Rol | Flujo | Herramientas | Cadencia |
|---|---|---|---|---|
| Erik | Líder, infra y CI | `/inicio` → `/tarea` → `/adr` → `/cerrar`; aprueba ADRs de infra y revisa PR | comandos, CI, ADRs, `project-sync` | sync lunes y viernes |
| Emmanuel | Backend (API, ingesta, RBAC) | `/inicio` → `/tarea` → `/cerrar` | comandos, `ecc-nestjs-patterns`, `ecc-prisma-patterns` | sync lunes y viernes |
| Kira | Frontend y UX | `/inicio` → `/tarea` → `/cerrar` | comandos, `ecc-angular-developer` | sync lunes y viernes |
| Carlos | Dataset y QA | `/inicio` → `/tarea` → `/cerrar`; adjunta evidencia | comandos, evidencia | sync lunes y viernes |

Regla de trabajo: **1 issue `En progreso` por persona**; rama `feat/<issue>-<slug>`
desde `main`; bloqueo > 24 h se escala con etiqueta.

### Agentes

| Agente | Flujo | Herramienta | Dueño |
|---|---|---|---|
| Sesión (opencode) | `/inicio` → `/tarea` → `/cerrar` | comandos de `.opencode/commands/`, skills `docu-*`, superpowers | Erik |
| Explorador (subagente) | ola 1 de `/tarea`, antes de proponer | solo lectura (`read`, `grep`, `glob`, `lsp`) | Erik |
| Revisor (subagente) | antes de `/cerrar` o de aprobar un PR | solo lectura, calibrado | Erik |

## 3. Los dos ciclos

- **Ciclo del producto:** E1 (configuración y arranque) → M1 → K1 → C1 → C2 →
  S1–S4. Con fechas en `gestion/PLAN-EPICAS.md`; el estado vive en GitHub.
- **Ciclo del harness:** proponer → aprobar (ADR) → versionar (pin por commit) →
  deprecar. Todo cambio de herramienta sigue §5.

## 4. Puntos de autoridad

No se duplican aquí: la tabla **Capas de autoridad** de `docs/README.md` dice qué
fuente manda sobre qué tema (repositorio, ADR, GitHub, Drive, Engram) y qué
nunca es autoridad. Cuando dos fuentes discrepan, gana la que esa tabla indica y
la otra se corrige en el mismo PR.

## 5. Runbook de evolución del harness

Toda operación sobre las piezas con frontmatter (comandos, subagentes y skills)
pasa por `scripts/harness-check.sh` (falla en CI si el harness queda
inconsistente). El catálogo registra además MCP y scripts, que no llevan
frontmatter y se verifican por revisión en el PR.

| Operación | Quién aprueba | Cómo se documenta | Cómo se verifica |
|---|---|---|---|
| Alta de comando/skill/subagente | Erik | frontmatter (`dueno`, `disparador`, `proposito`) + fila en `CAPACIDADES.md` | `harness-check` en verde |
| Alta de MCP | Erik | `opencode.json` (`mcp`) + fila en `CAPACIDADES.md` (sección MCP) | `doctor` y revisión en el PR |
| Bump de pin (superpowers, skills vendorizadas) | Erik | subir `commit` en `UPSTREAMS.json` y en el `metadata` de la skill; PR | `harness-check` + prueba de la skill |
| Baja / deprecación | Erik | estado `deprecado` en `CAPACIDADES.md`; si toca arquitectura, ADR | `harness-check` y `doc-index` en verde |
| Cambio de dueño | Erik | `dueno` en el frontmatter + `proyecto/EQUIPO.md` | `harness-check` (el dueño debe existir en `EQUIPO.md`) |

Un cambio de pin de dependencia de primer nivel, o cualquier alta que fije una
política, además pide **ADR** (`plantillas/ADR.md`).

## 6. Puente multi-cliente

opencode es el entorno oficial (`ADR-0013`). Quien use otro cliente de agente
(Claude Code, Codex) lee `CLAUDE.md` y `AGENTS.md`; **no** se replican comandos
ni skills entre clientes (evita el drift que `ADR-0007` prohíbe). Lo que debe
valer siempre —verificación, índices, formato, trazabilidad— se exige en CI y en
`bun run verify`, que son client-agnósticos. Lo específico del agente
(superpowers, comandos) solo está garantizado dentro de opencode.
