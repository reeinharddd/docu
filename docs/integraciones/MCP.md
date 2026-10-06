# Integración: servidores MCP

Estado: vigente. Verificado el 2026-10-05.
Configuración del proyecto: `.mcp.json`, versionada. Credenciales por variable de
entorno, nunca en el archivo.

## Estado actual: cero servidores activos

`.mcp.json` se versiona **vacío a propósito**. Ningún candidato pasa hoy los siete
criterios de `HERRAMIENTAS-AGENTE.md`, y declarar uno a medias es peor que no
declarar ninguno: un MCP activo consume contexto, amplía la superficie y no es
reproducible para el resto del equipo.

| Candidato | Criterio que falla | Veredicto |
|---|---|---|
| Monday (tercero) | 4 — credencial privada obligatoria | Rechazado. Además el tablero ya se lee con GraphQL directo en 2 llamadas |
| Google Drive (tercero) | 4 — credencial OAuth | Rechazado por lo mismo |
| PostgreSQL | 1 — no es del proyecto PostgreSQL | Rechazado. La BD se consulta con `psql` |
| BullMQ / Redis | 1 — no es del proyecto Redis | Rechazado |
| Bull output (`@nestjs/bull`observability) | 1 — no es del proyecto BullMQ | Rechazado |
| Angular MCP | 1 — requiere confirmar que el endpoint sea servidor y no documentación | Sin verificar |
| Redis Docs (documentación) | No es un servidor MCP, es documentación | Fuera de alcance |

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
