# Integración: gestión del trabajo en GitHub

Estado: vigente desde 2026-10-06 (`decisiones/ADR-0008-github-como-gestor-del-equipo.md`).
Autoridad de: estado, responsable, fechas, sprint, dependencias. Nunca de código
ni de decisiones técnicas (`docs/README.md`, capas de autoridad).

Tablero: <https://github.com/users/reeinharddd/projects/1> (Project `DOCU`,
vinculado al repositorio).

## Regla de oro

**Las etiquetas del issue son la fuente.** Los campos del Project se llenan
solos con `scripts/project-sync.ts`, que corre en cada cambio de issue o PR y
cada mañana de lunes a viernes (`.github/workflows/project-sync.yml`). Nadie
mantiene dos veces el mismo dato.

## Dónde está cada cosa

| Concepto | En GitHub | Ejemplo |
|---|---|---|
| Épica | Issue `tipo:epica` con sub-issues; su barra de progreso es la de sus hijos | #48 Épica: Backend |
| Tarea, historia, investigación, entregable | Issue con `tipo:*` | #12 API NestJS |
| Subtarea | Sub-issue | #46 Worker (de #3) |
| Hito con fecha | Milestone | `Contrato de datos congelado` (2026-10-30) |
| Sprint | Etiqueta `sprint:N` → campo iteración `Sprint` | `sprint:2` |
| Prioridad | Etiqueta `prioridad:*` → campo `Prioridad` | `prioridad:critica` |
| Área | Etiqueta `epica:*` → campo `Épica` | `epica:diseno` |
| Requisito | Etiqueta `RF-0n` / `RNF-0n`; si falta, `req:pendiente` | `RF-01` |
| Dependencia | *Blocked by* nativo | #4 bloqueada por #3, #23 y #41 |
| Bloqueo > 24 h | Etiqueta `bloqueado` | — |
| Cronograma | Línea `Cronograma` del cuerpo → `Inicio` y `Fin` | `2026-10-12 → 2026-10-23` |
| Evidencia | PR con `Closes #N` + adjunto | — |

## Épicas

| Issue | Épica | Contiene |
|---|---|---|
| #47 | Infraestructura | Entorno, CI, arquitectura, Configuración 2, gestión del equipo |
| #48 | Backend | API, pipeline, worker, OCR, reportes y alertas |
| #49 | Frontend | Aplicación Angular (espera la puerta de diseño, ADR-0012) |
| #50 | Base de datos | Modelo, contrato, Configuración 1 |
| #51 | Autenticación | RBAC, matriz de roles, bitácora, reglas |
| #52 | QA/Documentación | Dataset, pruebas, SRS y documentación de cierre |
| #53 | Diseño | Prototipos, categorías, design system, playground |

## Campos del Project

| Campo | Cómo se llena |
|---|---|
| `Status` | Cerrado → `Listo`. PR abierto que lo cierra → `En revisión`. Nuevo → `Por hacer`. `En progreso` lo mueve la persona al empezar |
| `Épica` | `epica:*` del issue o de su padre |
| `Prioridad` | `prioridad:*` del issue o de su padre |
| `Sprint` | `sprint:N` → iteraciones: S1 12–23 oct (replan 2026-10-09), S2 19 oct–6 nov, S3 9–20 nov, S4 23 nov–4 dic. S1/S2 se solapan 19–23 oct por el replan aprobado; los sprints no se redefinen ni se mueven para hacer coincidir fechas |
| `Inicio`, `Fin` | Línea `Cronograma` del cuerpo, solo si el campo está vacío |
| `Estimación (h)` | A mano, opcional |
| Nativos | Assignees, Labels, Milestone, Parent issue, Sub-issues progress, Linked pull requests |

## Flujo de una tarea

1. Se crea con una plantilla (`Tarea`, `Investigación`, `Diseño`, `Entregable
   académico`, `Bug`) y se etiqueta: `epica:*`, `sprint:N`, `prioridad:*`, `RF-0n`.
2. Se cuelga de su épica como sub-issue y se marcan sus dependencias.
3. Quien la toma: `/tarea N` en OpenCode o `gh issue develop N --base main --checkout`,
   y la mueve a `En progreso`.
4. PR con `Closes #N`. El check `pr-issue` falla si falta (salvo etiqueta
   `sin-issue` para mantenimiento).
5. Al abrir el PR pasa sola a `En revisión`; al fusionarlo, a `Listo`.

## Comandos

```bash
gh issue list --assignee @me                      # mis tareas
gh issue list --milestone "Cierre de diseño"      # lo que vence en el hito
gh issue list --label req:pendiente               # tareas sin requisito
gh issue view 12                                  # detalle, sub-issues y dependencias
gh issue develop 12 --base main --checkout        # rama ligada al issue
gh pr create --fill                               # el cuerpo lleva "Closes #12"
GH_TOKEN=$(env -u GITHUB_TOKEN gh auth token) bun run project:sync   # sync manual
```

Los comandos `gh project` y el sync manual necesitan el scope `project`. Si tu
shell exporta `GITHUB_TOKEN`, `gh` usa ese token antes que tu sesión:
`env -u GITHUB_TOKEN gh auth refresh -h github.com -s project`.

## Permisos (agente y humanos)

| Acción | Permiso | Condición |
|---|---|---|
| Leer issues, milestones, Project | Automático | — |
| Comentar en un issue propio | Automático | — |
| Crear issue | Con confirmación | Con plantilla y etiquetas completas |
| Cambiar responsable, milestone, etiquetas de otro | Con confirmación | Petición del líder |
| Cerrar un issue | Solo vía PR fusionado o con evidencia en el comentario | Definición de Hecho (REGLAS 7) |
| Borrar issues o milestones | **Prohibido** | El histórico es evidencia: se cierra como `not planned` |
| Borrar una etiqueta | Con confirmación | Solo si no la usa ninguna plantilla ni issue, y queda registrado el motivo (§Limpieza de etiquetas) |

## Limpieza de etiquetas

Las etiquetas del sistema son la taxonomía de `proyecto/REQUISITOS.md` y
`PLAN-EPICAS.md` (más `bloqueado`, `req:pendiente`, `sin-issue` y `bug`). Las
etiquetas por defecto de GitHub que nadie usa se retiran para no confundir, con
el motivo anotado aquí.

- **2026-10-17**: retiradas 9 etiquetas por defecto sin un solo issue
  (`accessibility`, `documentation`, `duplicate`, `enhancement`, `invalid`,
  `question`, `wontfix`, `good first issue`, `help wanted`). Se conservó `bug`
  porque la plantilla `bug.yml` la asigna al crear el issue.

## Pendiente de configurar en la web (#43)

Estado 2026-10-17: **colaboradores ya con `Write`** (`Agent3835` = Emmanuel,
`kirxllix` = Kira) y sus issues asignados; `.github/CODEOWNERS` con usuarios
reales y el secreto `PROJECT_TOKEN` activo (el workflow `project-sync` corre en
verde, con cron de lunes a viernes). Falta el paso 2: las 5 vistas.
Estado 2026-10-19: se suma `WearyBerry` = Carlos con `Write`; sus issues #61,
#8 y #6 quedan asignados.

La API no permite crear vistas ni secretos de usuario. Una sola vez, Erik:

1. **Secreto `PROJECT_TOKEN`**: token *fine-grained* con permiso de lectura y
   escritura en *Projects* (cuenta) e *Issues*/*Pull requests* de lectura en el
   repo. En el repo: *Settings → Secrets and variables → Actions → New secret*.
   Sin él, el workflow avisa y no hace nada; el sync manual sigue funcionando.
2. **Vistas** del Project (*New view*):
   - **Tablero**: layout Board, agrupado por `Status`.
   - **Por épica**: layout Table, *Group by* `Épica`, columnas Status, Assignees, Sprint, Fin.
   - **Sprint actual**: Board con filtro `sprint:@current`.
   - **Roadmap**: layout Roadmap con `Inicio` → `Fin`, marcadores de milestone e iteración.
   - **Mis tareas**: Table con filtro `assignee:@me -status:Listo`.
3. **Workflows** integrados: dejar activo `Auto-add sub-issues to project`;
   activar `Item closed` → `Listo` y `Pull request merged` → `Listo` (el sync
   lo hace igual; los integrados son instantáneos).
4. **Colaboradores** rol *Write* y asignación de issues: **hecho 2026-10-17**
   (`Agent3835`, `kirxllix`) y **2026-10-19** (`WearyBerry` = Carlos); sus
   usuarios van a `proyecto/EQUIPO.md` y `.github/CODEOWNERS`.

## Origen

Hasta el 2026-10-06 el gestor fue Monday. Todo su contenido (tarjetas,
subelementos, comentarios con alcance y criterios) se migró a issues. En esa
migración se colaron datos de un plan académico ajeno a DOCU; el 2026-10-19 se
retiraron sus etiquetas, referencias y el directorio `academico/`. El registro
de la migración y su enmienda quedan en ADR-0008. La cuenta de Monday se dio de
baja (ADR-0008).
