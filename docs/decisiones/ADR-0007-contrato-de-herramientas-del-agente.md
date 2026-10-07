# ADR 0007 — El contrato del agente y sus herramientas viven en el repositorio

Fecha: 2026-10-05 · Estado: Aceptada · Decide: Erik · Revisa: el equipo

## Contexto

El equipo trabaja con distintos clientes de agente y con distintas
herramientas: skills, flujos, reglas de harness, plugins, servidores MCP,
prompts y utilidades. El problema aparece cuando esas herramientas viven en la
configuración personal de cada máquina:

1. Dos personas resolviendo lo mismo con reglas distintas y sin saberlo.
2. Un agente funciona en el equipo de una persona y falla en el de otra
   porque le falta una skill o un servidor MCP.
3. Un flujo funciona porque depende de un plugin local que no existe en ninguna
   otra parte.
4. Cuando algo se rompe, nadie sabe si el problema es del código o del entorno
   del agente.

Además, las tecnologías que usa el proyecto ya publican sus propias
herramientas oficiales para agentes: Angular tiene Agent Skills y un MCP oficial
del CLI, y Prisma tiene un repositorio oficial de skills. Ignorarlas y
construir las nuestras duplicaría trabajo.

La implementación concreta de skills y plugins se hará después. Esta ADR fija el
principio y las reglas de propiedad, no el formato.

## Decisión

**El contrato del agente y sus herramientas son parte del repositorio.**

1. **Reglas y flujo, en archivos versionados.** `AGENTS.md` es el índice del
   contrato de trabajo y `docs/` el detalle. Nada de esto depende del cliente.
2. **Configuración del cliente, versionada también.** El archivo de configuración
   del proyecto se versiona y declara las herramientas; las credenciales nunca,
   esas van en el `.env` local de cada máquina.
3. **Herramientas propias, versionadas.** Cualquier skill, comando, plugin,
   plantilla o script que el equipo use para trabajar vive en el repositorio o
   se referencia a una fuente remota con versión fijada. La frase "solo está
   instalado en un equipo" no es una solución.
4. **Herramientas oficiales primero.** Antes de escribir una skill, un MCP o un
   flujo, se busca el oficial o el de la comunidad mantenida de la tecnología:
   - Angular: <https://angular.dev/ai/agent-skills> y
     <https://angular.dev/ai/mcp>
   - Prisma: <https://github.com/prisma/skills>, instalable con
     `bunx @prisma/cli@7.10.0 agent install`. **Fijado a propósito**: `@latest`
     es `8.0.0-rc.20` y el proyecto usa Prisma 7 (`bing/STACK.md`)
   - GitHub: `gh` CLI, ya autenticado por cada persona (ADR-0008)
   - Documentación de Bun, NestJS, Redis, Ollama y PostgreSQL: links fijos en
     [ingenieria/STACK.md](../ingenieria/STACK.md)
5. **Remoto con versión, no "última versión".** Una referencia a un remoto
   apunta a un commit, tag o versión concreta. `latest` en una herramienta que
   afecta al código de todos es una bomba de relojería.
6. **Cada herramienta declara su dueño y su propósito** en el archivo de
   índice, igual que los documentos.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Dejar las herramientas en la configuración personal | Es exactamente el problema: reglas distintas por máquina y fallos inexplicables |
| Un repositorio aparte de skills | Añade un punto más donde el contrato puede quedar desincronizado del código que gobierna. Se pierde la atomicidad entre regla y código |
| Solo documentar "qué skill usar" en un README | La documentación sin ejecución no se aplica; la herramienta gana |
| Construir skills propias antes de revisar las oficiales | Trabajo duplicado y divergente |

## Consecuencias

- **A favor**: el mismo agente se comporta igual en las cuatro máquinas.
- **A favor**: los fallos de entorno se distinguen de los fallos de código.
- **A favor**: actualizar una skill es un PR revisable, con historia.
- **A favor**: se reaprovecha el trabajo oficial de Angular y Prisma en vez de
  reimplementarlo.
- **En contra**: hay que mantener una capa de configuración que hoy no existe.
  Costo único, asociado al primer PR de la capa.
- **En contra**: las herramientas oficiales cambian; fijarlas exige actualizarlas
  a propósito, no por sorpresa.
- **En contra**: el repo crece en archivos que no son código. Se mitiga con
  directorios claros y un índice, no con reglas dispersas.
- **Riesgo residual**: una skill compartida que encode una mala práctica
  multiplica el error entre las cuatro personas. Se mitiga con revisión en PR y
  con que las skills describan flujos, no impongan criterio.

## Estado de implementación

| Paso | Responsable | Estado |
|---|---|---|
| Definir dónde vive la configuración y la política | Erik | **Hecho.** `opencode.json` con `instructions`, `.mcp.json`, `CLAUDE.md` |
| Regla de versionado para referencias remotas | Erik | **Hecho.** Esta ADR, punto 5 |
| Criterio verificable de admisión de herramientas | Erik | **Hecho.** `integraciones/HERRAMIENTAS-AGENTE.md`, siete criterios |
| Veredicto sobre los MCP candidatos | Erik | **Hecho.** `integraciones/MCP.md`: ninguno entra todavía |
| Instalar y evaluar Agent Skills de Angular | Kira | Pendiente. K1 |
| Instalar y evaluar skills de Prisma | Emmanuel | Pendiente. M1 |
| Instalar las skills propias del equipo | Todos | **En curso.** `.opencode/skills/` y `.opencode/commands/` versionados; `scripts/setup.sh` deja la máquina lista (2026-10-06) |

## Evidencia

- [ADR-0001](ADR-0001-flujos-de-trabajo-del-agente.md) fija los flujos; esta
  ADR fija dónde viven las herramientas que los ejecutan.
- [ingenieria/STACK.md](../ingenieria/STACK.md) ya registra las herramientas
  oficiales disponibles por tecnología, con versión verificada.
- La configuración del proyecto está versionada en `opencode.json` y
  `.mcp.json`, sin credenciales; los nombres de variables están en `.env.example`.
- Verificación reproducible: `bun run doctor` y `bun run verify`
  (`operacion/BOOTSTRAP.md`).