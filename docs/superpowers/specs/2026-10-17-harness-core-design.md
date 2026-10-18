# Diseño — Core del harness de DOCU

Fecha: 2026-10-17 · Estado: Propuesta (para revisión) · Autor: Erik (con agente)
Ruta de origen: `brainstorming` (ADR-0001). Decisiones asociadas: ADR-0007, ADR-0013.

## 1. Contexto

DOCU tiene hoy un sistema documental maduro (`docs/README.md` es el índice y la
ley; `.indice` lo hace verificable en CI) y un harness de agente versionado
(ADR-0013: opencode, superpowers, Engram, comandos `docu-*`, skills propias y
vendorizadas, subagentes, catálogo MCP). Sin embargo, para un equipo que trabaja
con agentes hay cuatro huecos:

1. **No hay un mapa único del "cómo trabajamos".** El conocimiento está
   repartido en ~8 documentos (`README`, `REGLAS`, ADR-0001/0007/0013, `RITMO`,
   `GITHUB-GESTION`, `EQUIPO`, `HERRAMIENTAS-AGENTE`) sin una vista que los ate.
2. **No hay índice vivo de herramientas con dueño y disparador.** ADR-0007 §6
   lo exige ("cada herramienta declara su dueño y su propósito en el archivo de
   índice") y no existe: hoy **ninguna** skill, comando, subagente o MCP declara
   dueño. La propiedad está definida para personas, no para herramientas.
3. **La paridad multi-cliente no está resuelta** (se resuelve por decisión, no
   por duplicación).
4. **No hay runbook de evolución del harness** (crear/actualizar/deprecar
   herramientas): reglas sueltas, no un procedimiento.

## 2. Objetivo

Construir el **core del harness**: la capa que (a) da **conocimiento** —cualquier
persona o agente sabe qué flujo seguir, dónde está todo, quién es dueño de cada
pieza y cómo se actualiza— y (b) da **cumplimiento** —lo que debe valer siempre
se exige, y no se puede hacer mal. Sin reescribir los documentos que ya
funcionan: se **atan** y se hacen verificables.

## 3. No-objetivos (YAGNI)

- No se replican comandos/skills para otros clientes (Claude Code, Codex): la
  paridad es un **puente documentado** (`CLAUDE.md`, `AGENTS.md`).
- No se adopta automáticamente nada del catálogo de candidatos.
- No se reescriben `README`, `REGLAS`, ADR existentes ni `HERRAMIENTAS-AGENTE`.
- **No** se introduce `harness.manifest.json` (queda como upgrade opcional, §11).

## 4. Decisiones de esta fase (del brainstorming)

| # | Decisión |
|---|---|
| D1 | El trabajo principal es **conocimiento + cumplimiento** (no solo documentar) |
| D2 | El cumplimiento vive **a la par**: cliente (opencode) **y** CI (client-agnóstico) |
| D3 | Paridad multi-cliente = **solo opencode + puente documentado** |
| D4 | El barrido de stars/bookmarks/online es un **catálogo puntual**, hecho una vez |
| D5 | Enfoque **A** (docs como fuente + metadata verificable), con **B** como upgrade |

## 5. Artefactos

### 5.1 Nuevos

| Artefacto | Tipo | Dueño |
|---|---|---|
| `docs/HARNESS.md` | El mapa | Erik |
| `docs/integraciones/CAPACIDADES.md` | Índice vivo de herramientas | Erik |
| `docs/integraciones/CATALOGO-2026-10-17.md` | Barrido puntual de candidatos | Erik |
| `scripts/harness-check.sh` | Verificador (script) | Erik |
| `docs/decisiones/ADR-00NN-*.md` | ADR del core (siguiente número libre) | Erik |
| frontmatter de metadata en cada pieza | Metadata viva | dueño de la pieza |

### 5.2 Modificados

- `docs/README.md` — añade las rutas nuevas al índice y la ley.
- `docs/proyecto/EQUIPO.md` — añade la columna/sección de **dueños de
  herramientas** (hoy solo documentos).
- `docs/.indice` — regenerado (`doc-index.sh --fix`).
- `.github/workflows/ci.yml` — nuevo paso `harness-check`.
- `package.json` — los scripts `verify` y `doctor` incluyen `harness-check`.
- `AGENTS.md` (raíz) — apunta a `HARNESS.md` en la iniciación.

## 6. `docs/HARNESS.md` — contenido

1. **Propósito y cómo usarlo.** Dos lecturas: humano (onboarding) y agente
   (qué leer antes de actuar). Regla de oro: *si no está aquí o en el índice, no
   existe*.
2. **Cuadro rol → flujo → herramienta → dueño → cadencia.** Fila por persona
   (Erik, Emmanuel, Kira, Carlos) y por agente (explorador, revisor).
3. **Los dos ciclos.**
   - **Producto:** E1 → M1 → K1 → C1 → C2 → S1–S4 (enlaza `PLAN-EPICAS.md`).
   - **Harness:** proponer → aprobar (ADR) → versionar (pin/commit) → deprecar.
4. **Puntos de autoridad.** Copia-enlace de la tabla "Capas de autoridad" de
   `docs/README.md` (§ fuente → autoridad sobre → nunca es autoridad para).
5. **Runbook de evolución del harness.** Procedimiento para: alta de skill/
   comando/agente/MCP, baja, bump de pin (superpowers / vendor), y deprecación.
   Cada uno con: quién aprueba, cómo se documenta, cómo se verifica.
6. **Puente multi-cliente.** Qué debe leer un cliente distinto (`CLAUDE.md`,
   `AGENTS.md`) y qué no está garantizado.

## 7. `docs/integraciones/CAPACIDADES.md` — formato

Una tabla por tipo de pieza. Columnas mínimas:

| Pieza | Tipo | Dueño | Disparador | Propósito | Origen/Versión | Estado |

Cubre: comandos (`.opencode/commands/*`), skills propias
(`.opencode/skills/docu-*`), skills vendorizadas (`vendor/*`), subagentes
(`.opencode/agents/*`), MCP (`.mcp.json` core + extras), scripts (`scripts/*`) y
skills de superpowers usadas (por nombre).

## 8. Metadata viva (frontmatter)

Cada pieza del harness declara en su frontmatter YAML:

```yaml
dueno: <usuario-github o nombre de EQUIPO.md>
disparador: <cuándo se usa>
proposito: <una frase>
```

En vendorizadas, además `origen:` (repo + commit) y `version:`. `harness-check`
exige que `dueno` exista en `EQUIPO.md` y que la pieza aparezca en
`CAPACIDADES.md`.

## 9. `scripts/harness-check.sh` — qué valida

1. Toda pieza del harness (comando, skill propia y vendorizada, subagente) tiene
   los tres campos de metadata.
2. Cada `dueno:` existe en `EQUIPO.md`.
3. Cada pieza está listada en `CAPACIDADES.md` (y viceversa: sin piezas
   fantasma).
4. Los comandos que invocan un script (`scripts/*`) apuntan a scripts que
   existen.
5. Salida legible; falla con código ≠ 0 (apto para CI). Soporta `--fix` solo
   para regenerar secciones derivadas si aplica.

## 10. Cumplimiento (qué se exige y dónde)

| Regla | Cliente (opencode) | CI (client-agnóstico) |
|---|---|---|
| `bun run verify` | comando `/cerrar` la exige | job de CI (ya) |
| Metadata y vigencia del harness | hooks/comandos | `harness-check` (nuevo) |
| Dueño existente y declarado | — | `harness-check` |
| Índices, links, trazabilidad | — | doc-index, linkcheck, tracecheck (ya) |
| Commits, secretos, formato | lefthook | CI |
| Flujo del agente (brainstorm→plan→TDD→review) | comandos/agentes | `verify` |

## 11. Upgrade futuro (B, no ahora)

`harness.manifest.json` como fuente única desde la que se **generan** el índice
y `CAPACIDADES.md`; CI falla si divergen. Se migra desde la metadata sin
rehacer nada porque el manifest se deriva de los frontmatters de §8.

## 12. Verificación (cómo sabremos que sirve)

- `harness-check` en verde y corriendo en `verify` y CI.
- **Prueba dura:** un agente sin contexto previo resuelve una tarea real usando
  solo `HARNESS.md` + `CAPACIDADES.md` (sin preguntar dónde está nada).
- `doc-index`, `linkcheck`, `tracecheck` siguen en verde.

## 13. Riesgos

| Riesgo | Mitigación |
|---|---|
| Metadata desactualizada | `harness-check` falla fuerte y rápido en CI |
| Doble enforcement se siente pesado | Solo se exige lo que importa; el resto es guía |
| `HARNESS.md` se vuelve otro doc huérfano | Se enlaza desde `AGENTS.md`, `README` y `.indice`; es el punto de entrada |
| Catálogo de candidatos infla el índice | Vive en `integraciones/`; los candidatos no adoptados no entran al índice central |

## 14. Entradas pendientes

- **Ubicación de los bookmarks** del usuario (archivo local, export de
  navegador o solo stars+online): define el alcance del catálogo §5.1.
- **Siguiente número de ADR libre** para la ADR del core (al momento de
  escribirla; 0015 podría tomarlo la ADR de embeddings en M1).
