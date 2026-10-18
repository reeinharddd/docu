# ADR 0013 — OpenCode es el entorno oficial y todo el harness del agente vive en el repositorio

Fecha: 2026-10-10 · Estado: Aceptada · Decide: Erik · Revisa: el equipo

## Contexto

El equipo acordó usar opencode en las cuatro máquinas y que todo lo necesario
viva en el repositorio desde la primera clonada. ADR-0007 fijó el principio
—el contrato del agente y sus herramientas son parte del repo, cada uno con
dueño y propósito— y dejó explícito que "la implementación concreta de skills y
plugins se hará después". Esta ADR es esa implementación.

El riesgo que se elimina es el de ADR-0007: flujos que viven fuera del repo y
cada máquina deriva. A la fecha de esta ADR el harness ya está versionado en
`.opencode/` y en `opencode.json`, pero sin un ADR que lo nombre la definición
del puesto de trabajo quedaría dispersa entre dos documentos y una lista de
archivos.

## Decisión

**El puesto de trabajo oficial del agente es opencode, y todo el harness
concreto vive versionado en el repositorio.** Concretos:

1. **Cliente.** opencode. La única configuración versionada es `opencode.json`
   de la raíz; `.opencode/opencode.jsonc` es local, está en `.gitignore` y no
   debe divergir del contrato (`bun run doctor` avisa si existe).
2. **Flujos.** superpowers `v6.4.2` pineado (`opencode.json`, clave `plugin`
   singular), como implementación de los flujos de ADR-0001. Es la instalada por
   `scripts/setup.sh`. Actualizar superpowers es un PR que cambia el pin, nunca
   un `latest` ni un `sync` por máquina.
3. **Memoria.** Engram (`ENGRAM_PROJECT=docu`), MCP en `opencode.json` con
   `--project=docu` (pisa la entrada global). Indexa contexto de sesión según
   `integraciones/ENGRAM.md`; nunca reemplaza a `docs/` ni a GitHub Issues.
4. **Comandos propios.** `.opencode/commands/`: `inicio`, `tarea`, `brief`,
   `cerrar`, `estado`, `adr`.
5. **Skills propias.** `.opencode/skills/`: `docu-documentar`, `docu-gestion`,
   `docu-memoria`.
6. **Skills de terceros vendorizadas.** `.opencode/skills/vendor/`, admitidas
   por los siete criterios de ADR-0007 (`integraciones/HERRAMIENTAS-AGENTE.md`)
   y fijadas por commit. La procedencia vive en `vendor/UPSTREAMS.json`; hoy:
   - `ecc-angular-developer`, `ecc-nestjs-patterns`, `ecc-prisma-patterns` —
     `github.com/affaan-m/ECC`, commit `8384d60`; licencia declarada en su
     frontmatter (MIT).
   - `pp-code-reviewer` — `github.com/waybarrios/opencode-power-pack`, commit
     `9dccb6d`; licencia declarada en su frontmatter (Apache-2.0, modificada).
7. **Subagentes.** `.opencode/agents/`: `explorador` (descubrimiento
   solo-lectura) y `revisor` (revisión de un diff contra su base).
8. **Catálogo MCP.** `.mcp.json` es el catálogo del equipo, no el runtime:
   opencode solo lee la clave `mcp` de `opencode.json`. Core siempre activo
   (`engram`, `drive`); los extras viven apagados (`enabled false`) hasta su
   disparador. Detalle en `integraciones/MCP.md`.
9. **Puente multi-cliente.** `CLAUDE.md` (y `AGENTS.md`) dan el mismo contrato a
   quien no use opencode.
10. **Manda el repo.** Ante contradicción entre una skill (propia o vendorizada)
    y `AGENTS.md` o `docs/`, gana el repo. La propiedad y las reglas de admisión
    de herramientas son de ADR-0007; esta ADR solo fija **cuáles** y **dónde**.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| gentle-ai completo como contrato (`gentle-orchestrator` + 10 subagentes + perfiles) | Escribe en `~/.config/opencode/` y `.atl/`, exige instalador y `sync` por máquina y modelo de perfiles con `Tab`. No es clon-listo ni PR atómico; segunda curva sobre Bun/Nest/Angular para un equipo con poca experiencia. Queda como re-evaluación futura. |
| Propio ligero total, sin harness externo | Máximo control y cero dependencia, pero obliga a escribir desde cero TDD, debugging y revisión que superpowers ya trae probados (MIT). Se acepta como complemento (comandos `docu-*`), no como sustituto inmediato. |
| ECC / gstack como contrato completo | No es clon-listo ni PR atómico y suma una segunda curva para el equipo. Se descarta **como contrato**, pero sus skills puntuales **sí** entran vendorizadas (§Decisión 6) una vez verificada su fuente y fijada por commit |
| Dejar superpowers solo como configuración personal fuera del repo | Reproduce el problema de ADR-0007: reglas distintas por máquina y fallos inexplicables. Es lo que se quiere eliminar. |
| Escribir comandos y skills propias antes de revisar las oficiales | Trabajo duplicado y divergente (ADR-0007, punto 4) |

## Consecuencias

- **A favor**: una sola clonada deja el puesto completo (cliente, flujos,
  memoria, comandos, skills, subagentes, MCP) sin configuración personal.
- **A favor**: las cuatro máquinas ejecutan los mismos flujos con la misma
  versión; actualizar cualquiera de las piezas es un diff revisable.
- **A favor**: se reutilizan skills probadas (planes, TDD,
  verification-before-completion, revisión) en vez de reimplementarlas.
- **A favor**: Engram conserva contexto entre fases sin convertir la memoria en
  fuente de verdad.
- **En contra**: el repo asume un plugin externo pineado y skills vendorizadas;
  hay que seguir sus releases y subir el pin o el commit a propósito.
- **En contra**: superpowers inyecta bootstrap cada sesión (costo de contexto
  medio). Se mitiga con nombres distintos (cero colisión) y skills propias
  `docu-*`; ante contradicción de contenido mandan `AGENTS.md` y `docs/`.
- **Riesgo residual**: una skill del harness (propia o vendorizada) que encode
  una mala práctica se multiplica por cuatro. Se mitiga con revisión en PR y la
  regla repo-gana.

## Estado de implementación

| Pieza | Ubicación | Estado |
|---|---|---|
| Cliente y config | `opencode.json` (raíz); `.opencode/opencode.jsonc` local | **Hecho** |
| Flujos | `opencode.json` (`plugin`, superpowers `v6.4.2`) | **Hecho** |
| Memoria | `opencode.json` (`mcp.engram`); `integraciones/ENGRAM.md` | **Hecho** |
| Comandos propios | `.opencode/commands/` (6) | **Hecho** |
| Skills propias | `.opencode/skills/docu-*` (3) | **Hecho** |
| Skills vendorizadas | `.opencode/skills/vendor/` (4) + `vendor/UPSTREAMS.json` | **Hecho** |
| Subagentes | `.opencode/agents/` (2) | **Hecho** |
| Catálogo MCP | `.mcp.json`; `integraciones/MCP.md` | **Hecho** |
| Puente multi-cliente | `CLAUDE.md` | **Hecho** |

## Evidencia

- superpowers MIT, release `v6.4.2`, instalable en opencode por spec git con
  pin `#v6.4.2` (docs `README.opencode.md` del proyecto upstream).
- `opencode.json` versionado con `instructions` a `AGENTS.md`, `docs/REGLAS.md`
  y `docs/decisiones/README.md`; `mcp` con `engram` y `drive` core; permisos por
  comando ya declarados; LSP nativo permitido (navegación solo-lectura:
  definición, referencias, símbolos).
- Skills vendorizadas con procedencia en su frontmatter y en
  `.opencode/skills/vendor/UPSTREAMS.json`: `ecc-*` → `github.com/affaan-m/ECC`
  commit `8384d60`; `pp-code-reviewer` → `github.com/waybarrios/opencode-power-pack`
  commit `9dccb6d`.
- `scripts/setup.sh` instala opencode y deja la máquina lista; `.env.example`
  ya declara `ENGRAM_PROJECT=docu`.
- Verificación reproducible: `bun run doctor` y `bun run verify`
  (`operacion/BOOTSTRAP.md`).

## Qué nos haría revertirla

Si el pin impide arrancar en una máquina del equipo, si el costo de contexto
bloquea sesiones reales, o si una skill del harness contradice `AGENTS.md` de
forma no adaptable. En ese caso se quita el pin y se vuelve a propio ligero,
sin reescribir esta ADR.
