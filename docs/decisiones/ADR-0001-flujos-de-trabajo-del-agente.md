# ADR 0001 — Flujos de trabajo del agente dentro del proyecto

Fecha: 2026-09-26 · Estado: Aceptada · Decide: Erik · Revisa: el equipo

## Contexto

El proyecto lo trabajan cuatro personas y varios agentes, no todos con el
mismo cliente. Sin un flujo acordado, cada agente produce con su propio estilo:
uno escribe sin tests, otro inventa alcance, otro deja la decisión solo en su
memoria local. El costo no es el código: es la inconsistencia entre máquinas y
la pérdida de decisiones.

## Decisión

Flujos por momento del trabajo, no por herramienta:

1. **Pensar**: `brainstorming` → `sdd-flow` (ligero) → `writing-plans`.
2. **Hacer**: `feature-dev` + TDD + `verification-before-completion` + revisión
   cruzada (`requesting-code-review`, `receiving-code-review`, `code-reviewer`).
3. **Colaborar**: `state-tracking` para el estado actual, `handoff` entre
   sesiones, `dispatching-parallel-agents` para olas independientes,
   `using-git-worktrees` para features aisladas, `executing-plans` con
   checkpoints.
4. **Agente**: `core-constitution` + `skill-router` como única autoridad de
   carga de skills; `capability-scanner` antes de afirmar que no hay skill;
   `system-context` solo bajo petición explícita.

Reglas que acompañan al flujo y no son negociables:

- Un ADR por decisión de ingeniería, en `decisiones/`.
- Un tipo de documento por tipo de información, en `docs/README.md`.
- Evidencia antes de afirmar "ya quedó": comando, captura o video.
- Si algo puede ser archivo versionado y debe ser verdad para los cuatro, va
  al repositorio; la memoria lo indexa.
- El cliente de agente es un detalle. El contrato vive en `AGENTS.md` y
  `docs/`, no en la configuración personal de una máquina.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Un único flujo rígido para todo | Un PR de un carácter no necesita TDD ritual; una épica sí |
| Dejar el flujo en la configuración personal de cada agente | Cada máquina tendría reglas distintas; es exactamente el problema que se quiere evitar |
| Sin flujo, "cada quien con lo suyo" | Es el estado actual: produce inconsistencia y decisiones perdidas |

## Consecuencias

- **A favor**: cualquier agente, con cualquier cliente, produce el mismo tipo de
  artefacto en el mismo lugar.
- **A favor**: el historial en el repositorio permite reconstruir por qué el
  sistema es como es sin depender de la memoria de una sola máquina.
- **En contra**: escribir ADR y documento de decisión cuesta tiempo que antes se
  evitaba. Se acepta solo para decisiones de primer nivel, no para todo cambio.
- **En contra**: el flujo vive en skills que pueden no estar instaladas en
  todas las máquinas. Por eso las reglas que importan están escritas en
  `AGENTS.md` y `docs/`, y la skill es el mecanismo, no la ley.

## Lo que no hacemos

TDD ritual sin un seam determinista útil; transcripts como ceremonia; precargar
skills; decir "no hay capability" sin pasar el scanner; suprimir tipos con
`as any`; borrar o debilitar tests para que pasen; documentar decisiones de
ingeniería en un párrafo suelto dentro de un README.

## Evidencia

- Este ADR, más [0002](ADR-0002-bun-como-runtime-y-gestor.md) a
  [0006](ADR-0006-ia-propone-humano-dispone.md).
- `docs/README.md` con la taxonomía documental.
- `docs/decisiones/README.md` con el proceso y el índice.