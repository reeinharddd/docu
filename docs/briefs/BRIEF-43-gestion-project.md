# BRIEF #43 — Gestión: colaboradores, vistas y automatizaciones del Project

## 0. Encabezado

- Issue: #43
- Dueño: Erik
- Fechas: 2026-10-12 → **2026-10-13** · Sprint 1 · hito `Cierre de diseño` (2026-10-23)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Infraestructura / gestión
- Requisitos: ninguno directo; sostiene ADR-0008 (GitHub como gestor)
- Bloqueado por: nada · Bloquea a: todo el seguimiento (sin esto nadie sabe en qué está)

Replanificación 2026-10-09: fechas 07→09-oct a 12→16-oct.

## 1. Contexto

Monday se dio de baja; GitHub Issues + Project es el centro único de operación (ADR-0008). Hoy los `assignees` están vacíos, las vistas web están pendientes y el sync manual depende de cada máquina. Esta tarea deja la gestión usable el lunes 12.

## 2. Por qué importa tu parte

Sin colaboradores asignados y sin vistas, el sync del lunes es ciego: nadie sabe quién tiene qué `En progreso`, qué venció ni qué está `bloqueado`. Si sale bien, cada persona hace `gh issue list --assignee @me` y trabaja.

## 3. Objetivo y resultado esperado

Project operable con gente, vistas y sync automático.

| Entregable | Evidencia |
|---|---|
| Colaboradores con Write + issues asignados | #11→Kira, #29/#9→Carlos, #32→Erik, #7→Emmanuel, resto según EQUIPO; usuarios en `EQUIPO.md` |
| 5 vistas web del Project | Tablero (por Status), Por épica, Sprint actual, Roadmap (Inicio→Fin), Mis tareas — captura en el PR |
| Secreto `PROJECT_TOKEN` | Workflow `project-sync.yml` en verde (no solo aviso); `scripts/project-sync.ts` mapea etiquetas→campos |
| Sprints e iteraciones coherentes | S1 12–23 oct tras replan (`GITHUB-GESTION.md` §Campos corregido en este commit); `Inicio`/`Fin` desde línea `Cronograma` |
| Regla 1 persona = 1 En progreso | Tablero del lunes 12 sin duplicados |

## 4. Actividades específicas

1. Invitar (1 h, web, la API no puede): colaboradores Write, secreto `PROJECT_TOKEN` (fine-grained: Projects RW cuenta + Issues/PR lectura repo), vistas según `GITHUB-GESTION.md` §Pendiente. Terminado: captura por vista.
2. Asignar (1 h): `gh issue edit N --add-assignee <user>` por cada issue E1; mover a `En progreso` lo que arranque el 13. Terminado: `gh issue list` sin huérfanos E1 (#39 → Emmanuel, ya asignado como `Agent3835`; #36 cerrado como no planificado; Carlos sin cuenta, manda su dueño nominal).
3. Verificar sync (1 h): `GH_TOKEN=$(env -u GITHUB_TOKEN gh auth token) bun run project:sync`; abrir/cerrar un PR de prueba si hace falta. Terminado: campos Status/Épica/Sprint/Fin se llenan solos.
4. Documentar desvíos (30 min): si algo no se pudo en web, anotarlo en #43 con captura. Terminado: #43 cierra con evidencia.

Total estimado: 3–4 h. Hacer el lunes 12 para que el equipo arranque con el tablero listo.

## 5. Entradas y salidas

- Recibe: `EQUIPO.md` (quién hace qué), `GITHUB-GESTION.md` (§Permisos y §Pendiente), ADR-0008.
- Entrega: al equipo, Project usable + comentario en #43 con capturas. Después: cada uno mueve su issue.

## 6. Referencias y caja de herramientas

- `docs/integraciones/GITHUB-GESTION.md` (pasos exactos, comandos `gh`, tabla de campos).
- `scripts/project-sync.ts`, `.github/workflows/project-sync.yml`.
- Comandos: `gh issue list --assignee @me`, `gh issue develop N --base main --checkout`.

Recursos oficiales para gestionar (leer antes del finde):

| Para | Recurso | Cuándo usarlo |
|---|---|---|
| Issues y milestones | https://docs.github.com/en/issues/tracking-your-work-with-issues | Al crear/etiquetar issues con plantilla |
| Projects (vistas, campos, workflows) | https://docs.github.com/en/issues/planning-and-tracking-with-projects | Al crear las 5 vistas y activar `Item closed → Listo` |
| `gh` CLI | https://cli.github.com/manual (referencia de `issue edit`, `issue develop`) | Al asignar issues por terminal |
| Mensajes de commit del repo | https://conventionalcommits.org (`feat:`, `fix:`, `docs:`, `chore:`) | Al revisar que cada PR cumpla el hook `formato` |

## 7. Cómo trabajar

- Parte web (vistas, secreto, colaboradores) + parte repo (EQUIPO ya actualizado en este PR).
- ERIK NO DEBE: borrar issues o milestones (prohibido: se cierran como `not planned`); borrar etiquetas salvo que no las use nadie y quede el motivo anotado; editar campos del Project a mano salvo `Status = En progreso`.
- ERIK SÍ DEBE: pedir confirmación del líder antes de cambiar responsable de otro (aquí ya está dada para #32→Erik y #7→Emmanuel).
- Cambiar responsable/hito de otro sin esa confirmación está prohibido.

## 8. Criterios de aceptación

- [ ] Los 4 tienen sus issues E1 asignados y 1 solo `En progreso` el lunes.
- [ ] Las 5 vistas existen (captura en #43).
- [ ] `project-sync` corre sin aviso de secreto faltante.
- [ ] #39 ya asignado (`Agent3835`); #36 cerrado como no planificado.

No es done si: el sync sigue manual por máquina; hay issues E1 sin assignee y sin motivo.

## 9. Riesgos nombrados

El scope `project` del token (`gh auth refresh -s project`) o `GITHUB_TOKEN` exportado bloquea el sync. Mitigación: `env -u GITHUB_TOKEN` + refresh documentado en `GITHUB-GESTION.md`; desde el 2026-10-12 sin vistas es bloqueo del sync.

## 10. Revisión

Martes 2026-10-13 en el sync: tablero en vivo, 5 min. Después: ritmo semanal solo (`RITMO-SEMANAL.md`).
