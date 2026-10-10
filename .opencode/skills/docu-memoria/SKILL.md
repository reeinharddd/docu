---
name: docu-memoria
description: Como usar Engram (memoria del proyecto) en DOCU - cuando buscar, cuando guardar y que nunca va a memoria. Usar al empezar (/inicio, /tarea) y al cerrar trabajo.
---

# Memoria del proyecto en DOCU

Engram guarda **contexto de sesión**: lo que costó averiguar, decisiones con su
motivo y el índice para reencontrarlo. Proyecto: `docu` (`ENGRAM_PROJECT` en
`.env`). Requisito local: binario `engram` en el PATH; el MCP viene del repo
(`opencode.json`, ver `docs/operacion/BOOTSTRAP.md`).
Política completa: `docs/integraciones/ENGRAM.md`. Si discrepan, gana el documento.

## Al empezar (/inicio, /tarea)

1. Busca memoria relevante antes de leer docs: `engram_mem_search` con el tema
   del issue o la tarea (2-3 consultas distintas, no una sola).
2. Si un hallazgo contradice al repo, **gana el repo** y la memoria se corrige.
3. Lo que ya está en `docs/` se lee en el archivo, no se re-graba en memoria.

## Al cerrar

Guarda **solo lo que costó trabajo averiguar** con `engram_mem_save`
(versión real, gotcha de API, nombre de columna, decisión con motivo). Formato:

- Título corto y buscable.
- `What / Why / Where (archivo del repo) / Learned`.
- Toda memoria con decisión **apunta al archivo del repo** que la sostiene.

## Nunca a memoria

Secretos o valores de `.env`, rutas personales o de una sola máquina, ADRs o
versiones del stack (van en `docs/`), estado de tareas (van en GitHub Issues).
