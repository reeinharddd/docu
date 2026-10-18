# Capacidades del harness

Estado: vigente. Última actualización: 2026-10-17. Dueño: Erik (`reeinharddd`).

Índice **vivo** de las piezas del harness. Si una pieza falta aquí, gana el
archivo y se corrige el índice: `scripts/harness-check.sh` cruza esta tabla con
el disco y falla en CI. El mapa y el runbook están en `docs/HARNESS.md`.

Las piezas con ruta (`.opencode/...`) se verifican contra el disco. Las
secciones de MCP y scripts son informativas (no llevan frontmatter propio).

## Comandos

| Pieza | Tipo | Dueño | Disparador | Propósito | Origen/Versión | Estado |
|---|---|---|---|---|---|---|
| `.opencode/commands/inicio.md` | comando | Erik | al empezar la sesión | Prepara a la persona con quién es, sus tareas y el siguiente paso | propio | activo |
| `.opencode/commands/tarea.md` | comando | Erik | al empezar a trabajar un issue | Lee contexto, crea la rama y propone plan | propio | activo |
| `.opencode/commands/brief.md` | comando | Erik | al delegar un issue a una persona | Redacta el brief con la plantilla oficial | propio | activo |
| `.opencode/commands/adr.md` | comando | Erik | al registrar una decisión | Genera una ADR con la plantilla y el siguiente número libre | propio | activo |
| `.opencode/commands/cerrar.md` | comando | Erik | al terminar el trabajo de la rama | Verifica, commitea y abre el PR que cierra el issue | propio | activo |
| `.opencode/commands/estado.md` | comando | Erik | al pedir el estado | Resume git, issues, hitos y bloqueos | propio | activo |

## Subagentes

| Pieza | Tipo | Dueño | Disparador | Propósito | Origen/Versión | Estado |
|---|---|---|---|---|---|---|
| `.opencode/agents/explorador.md` | subagente | Erik | en la ola 1 de `/tarea` | Descubrimiento solo-lectura del repo | propio | activo |
| `.opencode/agents/revisor.md` | subagente | Erik | antes de `/cerrar` o de aprobar un PR | Revisión solo-lectura y calibrada de un diff | propio | activo |

## Skills propias

| Pieza | Tipo | Dueño | Disparador | Propósito | Origen/Versión | Estado |
|---|---|---|---|---|---|---|
| `.opencode/skills/docu-documentar/SKILL.md` | skill | Erik | antes de tocar `docs/` | Taxonomía, ADR, briefs e índice documental | propio | activo |
| `.opencode/skills/docu-gestion/SKILL.md` | skill | Erik | antes de tocar un issue | Convenciones de gestión en GitHub Issues | propio | activo |
| `.opencode/skills/docu-memoria/SKILL.md` | skill | Erik | al empezar y al cerrar trabajo | Cómo usar Engram (memoria del proyecto) | propio | activo |

## Skills vendorizadas

| Pieza | Tipo | Dueño | Disparador | Propósito | Origen/Versión | Estado |
|---|---|---|---|---|---|---|
| `.opencode/skills/vendor/ecc-angular-developer/SKILL.md` | skill | Erik | al crear o revisar código Angular | Patrones y buenas prácticas de Angular 22 | ECC `8384d60` (MIT) v2.2.3 | activo |
| `.opencode/skills/vendor/ecc-nestjs-patterns/SKILL.md` | skill | Erik | al construir o revisar un backend NestJS | Patrones de arquitectura NestJS | ECC `8384d60` (MIT) v2.2.3 | activo |
| `.opencode/skills/vendor/ecc-prisma-patterns/SKILL.md` | skill | Erik | al escribir esquema o consultas Prisma | Patrones y trampas de Prisma ORM | ECC `8384d60` (MIT) v2.2.3 | activo |
| `.opencode/skills/vendor/pp-code-reviewer/SKILL.md` | skill | Erik | al revisar cambios | Revisión de código por confianza | opencode-power-pack `9dccb6d` (Apache-2.0) | activo |

## MCP (informativo; habilitados en `opencode.json`)

| Pieza | Tipo | Dueño | Disparador | Propósito | Origen/Versión | Estado |
|---|---|---|---|---|---|---|
| `engram` | MCP | Erik | al buscar o guardar memoria | Memoria persistente del proyecto | `--tools=agent --project=docu` | activo |
| `drive` | MCP | Erik | al leer o escribir entregas | Google Drive de solo lectura en vivo | `mcp-remote` | activo |
| `playwright` | MCP | Erik | en QA web | Automatización de navegador | `@playwright/mcp` 0.0.83 | inactivo |
| `angular-cli` | MCP | Erik | consultar el workspace Angular | Angular CLI en modo solo-lectura | `@angular/cli` 22.2.1 | inactivo |
| `postgres` | MCP | Erik | consultar la base | Acceso a PostgreSQL | `server-postgres` 0.6.2 | inactivo |
| `redis` | MCP | Erik | inspeccionar colas | Acceso a Redis | `mcp-redis` 0.5.1 | inactivo |
| `firecrawl` | MCP | Erik | investigación web | Scraping y búsqueda | remoto v2 | inactivo |

## Scripts (informativo)

| Pieza | Tipo | Dueño | Disparador | Propósito | Origen/Versión | Estado |
|---|---|---|---|---|---|---|
| `scripts/harness-check.sh` | script | Erik | en `verify` y CI | Verifica la metadata del harness | propio | activo |
| `scripts/doc-index.sh` | script | Erik | en `verify` y CI | Verifica el índice documental | propio | activo |
| `scripts/docs-linkcheck.sh` | script | Erik | en CI | Verifica enlaces de la documentación | propio | activo |
| `scripts/docs-briefcheck.sh` | script | Erik | en CI | Verifica los briefs | propio | activo |
| `scripts/docs-tracecheck.sh` | script | Erik | en CI | Verifica trazabilidad requisito↔issue | propio | activo |
| `scripts/project-sync.ts` | script | Erik | tras cambios de etiquetas | Llena los campos del Project de GitHub | propio | activo |
| `scripts/setup.sh` | script | Erik | al instalar la máquina | Arranque del entorno | propio | activo |
| `scripts/doctor.sh` | script | Erik | al diagnosticar | Diagnóstico del entorno | propio | activo |
| `scripts/dev.sh` | script | Erik | al desarrollar | Levanta el entorno de desarrollo | propio | activo |
| `scripts/smoke-api.sh` | script | Erik | en `verify` | Arranca la API y consulta `/health` | propio | activo |
| `scripts/drive-check.sh` | script | Erik | al verificar Drive | Comprueba el acceso a Drive | propio | activo |
| `scripts/memory-export.sh` | script | Erik | al exportar memoria | Exporta la memoria de Engram | propio | activo |

## Candidatos (no adoptados)

Fuera del catálogo vivo: lo que todavía no es herramienta del harness.

| Pieza | Tipo | Dueño | Disparador | Propósito | Origen/Versión | Estado |
|---|---|---|---|---|---|---|
| `docs/integraciones/CATALOGO-2026-10-17.md` | documento | Erik | al evaluar una herramienta nueva | Barrido de candidatos (stars) | propio | vigente |
| `docs/integraciones/INVESTIGACION-HERRAMIENTAS.md` | documento | Erik | al evaluar una herramienta nueva | Investigación base y veredictos | propio | vigente |
