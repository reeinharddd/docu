# Integración: gestión del trabajo en GitHub

Estado: vigente desde 2026-10-06 (`decisiones/ADR-0008-github-como-gestor-del-equipo.md`).
Autoridad de: estado, responsable, fechas, sprint, dependencias. Nunca de código
ni de decisiones técnicas (`docs/README.md`, capas de autoridad).

## Dónde está cada cosa

| Concepto | En GitHub | Ejemplo |
|---|---|---|
| Tarea, historia, entregable | Issue | #12 API NestJS |
| Subtarea | Sub-issue | #18 Leer Excel con validación por familia (de #3) |
| Hito con fecha | Milestone | `Contrato de datos congelado` (2026-10-23) |
| Épica | Etiqueta `epica:*` | `epica:backend` |
| Sprint | Etiqueta `sprint:N` | `sprint:1` |
| Requisito | Etiqueta `RF-0n` / `RNF-0n` | `RF-01` |
| Requisito sin asignar | Etiqueta `req:pendiente` | #7 Configuración 1 |
| Prioridad | Etiqueta `prioridad:*` | `prioridad:critica` |
| Dependencia | *Blocked by* nativo | #4 bloqueada por #3 y #23 |
| Bloqueo > 24 h | Etiqueta `bloqueado` | — |
| Estado y cronograma | Campos del Project | `Estado`, `Inicio`, `Fin` |
| Evidencia | PR que cierra el issue (`Closes #N`) + adjunto | — |

## Hitos

| Milestone | Fecha |
|---|---|
| Cierre de diseño | 2026-10-16 |
| **Contrato de datos congelado** | **2026-10-23** |
| Fin del desarrollo | 2026-11-20 |
| Listos para presentar | 2026-11-27 |
| Presentación de diciembre | 2026-12-01 |

## Comandos que usa todo el equipo

```bash
gh issue list --assignee @me                      # mis tareas
gh issue list --milestone "Cierre de diseño"      # lo que vence en el hito
gh issue list --label req:pendiente               # tareas sin requisito
gh issue view 12                                  # detalle, sub-issues y dependencias
gh issue develop 12 --name feat/12-api-modelo --checkout   # rama ligada al issue
gh pr create --fill                               # el cuerpo lleva "Closes #12"
```

## Permisos (agente y humanos)

| Acción | Permiso | Condición |
|---|---|---|
| Leer issues, milestones, Project | Automático | — |
| Comentar en un issue propio | Automático | — |
| Crear issue | Con confirmación | Formato de `plantillas/BRIEF.md` o plantilla `tarea` |
| Cambiar responsable, milestone, etiquetas de otro | Con confirmación | Petición del líder |
| Cerrar un issue | Solo vía PR fusionado o con evidencia en el comentario | Definición de Hecho (REGLAS 7) |
| Borrar issues, etiquetas o milestones | **Prohibido** | El histórico es evidencia: se cierra como `not planned` |

## Project `DOCU`

Tablero: <https://github.com/users/reeinharddd/projects/1>, vinculado al
repositorio. Todos los issues están dentro.

| Campo | Valores |
|---|---|
| `Status` | `Por hacer`, `En progreso`, `En revisión`, `Listo` |
| `Inicio`, `Fin` | Fechas del cronograma (alimentan la vista Roadmap) |
| Nativos | Assignees, Labels, Milestone, Parent issue, Sub-issues progress, Linked pull requests |

```bash
gh project item-list 1 --owner reeinharddd --limit 100
gh project item-add 1 --owner reeinharddd --url <url-del-issue>   # si un issue no aparece
```

Los comandos `gh project` necesitan el scope `project`. Si tu shell exporta
`GITHUB_TOKEN`, `gh` usa ese token antes que tu sesión:
`env -u GITHUB_TOKEN gh auth refresh -h github.com -s project`.

## Pendiente de configurar en la web (la API no lo permite)

La hace Erik, una sola vez, en *Settings* del Project:

1. Vistas: **Tablero** (agrupado por `Status`), **Tabla** (agrupada por
   etiqueta `epica:*`) y **Roadmap** (`Inicio` → `Fin`, marcadores de milestone).
2. *Workflows*: `Auto-add to project` con filtro `is:issue,pr` del repositorio;
   `Item closed` y `Pull request merged` → `Listo`; `Item reopened` →
   `En progreso`. Revisar que apunten a las opciones en español.
3. Invitar a los compañeros como colaboradores con rol *Write* y asignarles sus
   issues (`gh issue edit N --add-assignee <usuario>`).

## Origen

Hasta el 2026-10-06 el gestor fue Monday. Todo su contenido (tarjetas,
subelementos, comentarios con alcance y criterios, plan académico EC0935) se
migró a issues y a `academico/EC0935.md`, y la cuenta se dio de baja
(ADR-0008).
