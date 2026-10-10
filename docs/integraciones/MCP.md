# Integración: servidores MCP

Estado: vigente. Verificado el 2026-10-06.
Configuración del proyecto: `.mcp.json`, versionada. Credenciales por variable de
entorno, nunca en el archivo.

## Estado actual: core activo, extras apagados

`.mcp.json` es el **catálogo del equipo** (core + extras delimitados).
El runtime (`opencode.json`, clave `mcp`) trae los extras con
`enabled false`: declarados y pineados, cero costo de contexto hasta que una
tarea los pida. opencode no lee `.mcp.json`; solo lee su propia clave `mcp`.

Opt-in por tarea: `enabled true` en tu config global personal, o cambio local
sin commitear. Nunca se commitea un extra encendido sin su disparador.

No existen `opencode.local.json` ni `.aiignore` en opencode V1 (verificado en
su código): serían config muerta. El opt-in es la config global personal.

| Candidato | Criterio que falla | Veredicto |
|---|---|---|
| Google Drive (tercero) | 4 — credencial OAuth no versionable | **Versionado sin secreto.** Comando y URL en `opencode.json` (sin credencial); OAuth por máquina en `.env`. Solo lectura, regla dura en `DRIVE.md` |
| PostgreSQL | parcial (MCP de la org MCP, no del proyecto PG) | **Extra apagado.** `@modelcontextprotocol/server-postgres@0.6.2` en `opencode.json` con `enabled false`, disparador M1. Expone SQL completo: rigen §8 |
| Redis (oficial `redis/mcp-redis@0.5.1`) | — | **Extra apagado.** Vía `uvx` (requiere Python por máquina), disparador C1 worker/colas. Al activar, ajustar URL al `REDIS_PORT` local |
| Prisma | sin MCP oficial (`@prisma/mcp` no existe) | Se cubre con skills oficiales en M1, no con MCP |
| Angular MCP (oficial del CLI) | — | **Extra apagado.** `@angular/cli@22.2.1 mcp --read-only --local-only` en `opencode.json` con `enabled false`, `cwd apps/web`, disparador K1. Solo lectura, sin red |
| Redis Docs (documentación) | No es un servidor MCP, es documentación | Fuera de alcance |
| BullMQ | sin MCP oficial | Se opera con código + tablero app en C1, no con MCP |

GitHub no necesita MCP: el agente usa `gh`, que `scripts/setup.sh` instala y
autentica en cada máquina, con permisos por comando en `opencode.json`. Evita
un token extra y el costo de contexto de un servidor completo.

## Capacidades base del equipo (las 3 listas para todos)

`.mcp.json` sigue vacío: la base no vive ahí sino una capa por pieza, toda
reproducible desde la clonada:

| Capacidad | Dónde se configura | Estado |
|---|---|---|
| Engram (memoria) | `opencode.json` del repo (pisa la entrada global) + binario por máquina, `ENGRAM_PROJECT=docu` | Requerido |
| Drive (lectura) | `opencode.json` del repo + OAuth por máquina (`ACCESOS.md`) | Requerido para quien lea entregas |
| GitHub (gestión) | `gh` + `scripts/setup.sh`, permisos en `opencode.json` | Requerido |

## Capacidades futuras (disparador concreto, no promesa)

Playwright y Firecrawl ya viven como extras apagados (ver arriba). Resto:

| Candidato | Se activa cuando | Responsable |
|---|---|---|
| Angular CLI MCP | K1: trabajo frontend en `apps/web` (ya apagado, solo lectura) | Kira |
| PostgreSQL MCP | M1: contrato de datos (ya apagado; rigen §8) | Emmanuel |
| Redis MCP oficial | C1: worker y colas (ya apagado; requiere `uvx` por máquina) | Emmanuel |
| Skills oficiales de Prisma | M1: contrato de datos e ingesta (skills, no MCP) | Emmanuel |
| Subagentes propios (`.opencode/agents/`) | Olas paralelas en épicas que lo exijan; hoy las skills orquestan en el agente principal | El equipo |
| Modelos locales (Ollama) | M1: exista `ValidationPipe` y modelo que validar | Emmanuel |
| Context7 | Nunca como contrato (criterio 5); uso personal exploratorio, sin citar versiones de ahí | Cada quien |

## Reglas para aceptar uno

Las siete, sin excepción. Resumen operativo:

1. **Oficialidad**: lo publica el dueño del stack, no un tercero.
2. **Mantenimiento**: commit o release en los últimos 90 días.
3. **Licencia**: permiso de uso verificable en el repositorio.
4. **Sin credencial privada**, o con la credencial declarada en `.env.example` y
   su permiso documentado en `ACCESOS.md`.
5. **Versionable**: se fija una revisión exacta. Nada de `latest`.
6. **Coste de contexto**: entra al presupuesto de la sesión o no entra.
7. **Encaje**: resuelve algo del stack real.

Un servidor que solo pasa 1–4 y falla 5 no entra: se rompe sin avisar.

## Dónde se declara

`.mcp.json` en la raíz del repositorio:

```json
{ "mcpServers": {} }
```

Se versiona el archivo, no el estado de la máquina. Lo local
(`.mcp.local.json`, `.claude/`, `.opencode/`) está en `.gitignore`.

## Procedimiento de alta

1. Anotar el candidato en `HERRAMIENTAS-AGENTE.md` con los siete criterios y la
   fecha de verificación.
2. Si pasa los siete: declararlo en `.mcp.json` con revisión exacta, variable de
   entorno para la credencial si hace falta, y fila en `ACCESOS.md`.
3. Si no pasa: dejar el motivo. Un candidato descartado con razón evita que se
   reabra el debate cada mes.
