---
name: docu-documentar
description: Como se escribe y se ubica la documentacion de DOCU - taxonomia por tipo, ADR, briefs, indice verificable y capas de autoridad. Usar antes de crear, mover o editar cualquier archivo en docs/.
---

# Documentar en DOCU

Ley del sistema: `docs/README.md`. Esta skill resume lo que mas se olvida.

## Donde va cada cosa

| Si es... | Va en |
|---|---|
| Por que se eligio X sobre Y | `docs/decisiones/ADR-NNNN-*.md` (plantilla `docs/plantillas/ADR.md`) |
| Como esta construido hoy | `docs/ingenieria/` |
| Como se usa y se ve | `docs/diseno/` (sin nombres de archivos de codigo) |
| Como se levanta o se rompe | `docs/operacion/` |
| Como se habla con un sistema externo | `docs/integraciones/` |
| Delegacion de una tarea | `docs/briefs/BRIEF-<issue>-<slug>.md` |
| Entregas de la materia | `docs/academico/` |
| Estado de una tarea | Issue de GitHub, nunca un documento |
| Contexto de una sesion | Memoria del agente, nunca un documento |

## Reglas

1. Espanol en docs, ingles en codigo y configuracion.
2. Un ADR no se reescribe: se escribe el siguiente con `Reemplazada por`.
3. La arquitectura describe el presente; el futuro va como ADR o issue.
4. Nada de secretos ni valores de `.env`, solo nombres de variables.
5. Versiones mencionadas = versiones reales de los `package.json`.
6. Todo archivo nuevo o borrado en `docs/` se refleja con `bash scripts/doc-index.sh --fix`. CI falla si el indice miente.
7. Cada documento tiene dueno en `docs/proyecto/EQUIPO.md`.
