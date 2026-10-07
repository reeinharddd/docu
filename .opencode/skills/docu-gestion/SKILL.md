---
name: docu-gestion
description: Convenciones de gestion del trabajo en DOCU sobre GitHub Issues - etiquetas, hitos, sub-issues, dependencias, ramas, PR y Definicion de Hecho. Usar antes de crear, mover, etiquetar o cerrar un issue, o al empezar una tarea.
---

# Gestion del trabajo en DOCU

Fuente completa: `docs/integraciones/GITHUB-GESTION.md`. Esta skill es el resumen
operativo; si discrepan, gana el documento.

## Modelo

| Concepto | Donde |
|---|---|
| Epica | Issue `tipo:epica` (#47-#53); toda tarea cuelga de una como sub-issue |
| Tarea, historia, investigacion, entregable | Issue con `tipo:*`, creado con plantilla |
| Subtarea | Sub-issue |
| Hito con fecha | Milestone |
| Epica / sprint / prioridad | `epica:*`, `sprint:N`, `prioridad:*` |
| Requisito | `RF-0n`, `RNF-0n`; si falta, `req:pendiente` |
| Plan academico | `ec0935` + `fase:N` |
| Dependencia | relacion nativa *blocked by* |
| Cronograma | linea `Cronograma` del cuerpo: `AAAA-MM-DD → AAAA-MM-DD` |

Las etiquetas son la fuente: `scripts/project-sync.ts` llena los campos del
Project (Status, Epica, Prioridad, Sprint, Inicio, Fin). Nunca edites esos
campos a mano salvo `Status = En progreso` al empezar.
| Bloqueo > 24 h | `bloqueado` y escalar al lider |

## Comandos

```bash
gh issue list --assignee @me
gh issue view N
gh api repos/{owner}/{repo}/issues/N/dependencies/blocked_by
gh api repos/{owner}/{repo}/issues/N/sub_issues
gh issue develop N --base main --checkout     # rama feat/N-slug
gh pr create --base main                      # cuerpo con "Closes #N"
GH_TOKEN=$(env -u GITHUB_TOKEN gh auth token) bun run project:sync
```

## Reglas

1. Una persona, un issue `En progreso`.
2. Rama `feat/<issue>-<slug>` desde `main`. Nada directo a `main`.
3. Un issue se cierra solo con PR fusionado que diga `Closes #N` (el check `pr-issue` lo exige; `sin-issue` solo para mantenimiento), o con evidencia en el comentario de cierre.
4. Nunca borrar issues, etiquetas ni hitos: se cierran como `not planned` con motivo.
5. Crear issues o cambiar responsable/hito de otra persona requiere confirmacion del lider.
6. Al cambiar etiquetas de requisito, actualizar `docs/gestion/TRAZABILIDAD.md` en el mismo PR.
7. Antes de cerrar: `bun run verify` en verde.
