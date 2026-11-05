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
| Hito con fecha | Milestone | `C1 modelo y BD` (2026-11-12) |
| Sprint | Etiqueta `sprint:N` → campo iteración `Sprint` | `sprint:3` |
| Prioridad | Etiqueta `prioridad:*` → campo `Prioridad` | `prioridad:critica` |
| Área | Etiqueta `epica:*` → campo `Épica` | `epica:diseno` |
| Requisito | Etiqueta `RF-0n` / `RNF-0n`; si falta, `req:pendiente` | `RF-01` |
| Dependencia | *Blocked by* nativo | #4 bloqueada por #11, #12 y #23 |
| Bloqueo > 24 h | Etiqueta `bloqueado` | — |
| Cronograma | Línea `Cronograma` del cuerpo → `Inicio` y `Fin` | `2026-11-13 → 2026-11-18` |
| Brief | Comentario fijado en el issue con el enlace; el issue manda el estado, el brief el detalle | `BRIEF-11` |
| Pantallas (#11) | Rama `feat/11-prototipos-ui-ux` desde `main`; el código de las pantallas sí viaja a `main` por PR | #11 |
| Evidencia | PR con `Closes #N` + adjunto | — |

## Briefs y ramas de trabajo

- Cada issue de tarea enlaza su brief en un comentario fijado (y en el cuerpo si
  el brief cambia). El brief explica el cómo; el issue manda el estado.
- El diseño ya no vive en un taller aparte: la rama `design/kira-playground`
  quedó abandonada. Las pantallas se construyen en la app real, en la rama
  `feat/11-prototipos-ui-ux`, y a `main` viajan el código, las specs,
  `docs/diseno/*` y las capturas (`BRIEF-11`).
- Cada carril arranca con `bash scripts/rama-env.sh <issue> feat/<issue>-<slug>`
  y su PR sale de esa rama con `Closes #N` (`gestion/CARRILES.md`).

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
| `Sprint` | `sprint:N` → iteraciones: S1 12–23 oct (replan 2026-10-09, cerrado), S2 2–6 nov, S3 7–19 nov, S4 20 nov–3 dic |
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

## Configs de rama (nunca se commitean)

Cada rama de feature trabaja con su propia config local de tarea, y **solo el
entregable viaja en el merge**. El principio: lo que la tarea *necesita* se
declara en el brief (§6) y eso sí se commitea; cómo se satisface en *tu
máquina* vive fuera del repositorio, así un PR no puede llevar configs ni por
accidente.

- `scripts/rama-env.sh <issue>` crea la rama (`gh issue develop`) y arma
  `.docu/rama/<slug>/` con los overrides locales (`COMPOSE_PROJECT_NAME`
  propio por rama, puertos y URLs si hay choque) y las notas de tarea. Esa
  carpeta está en `.gitignore`: jamás entra a un PR.
- Los MCPs opt-in se encienden por tarea en la config global personal o como
  cambio local sin commitear (`integraciones/MCP.md`).
- `.env`, `*.local`, `settings.local.json` y `.docu/` son de máquina. La
  infraestructura de datos ya es local por diseño (`ACCESOS.md`): cada
  máquina responde por su propia base, así el paralelismo no choca.
- Regla dura: si un diff hacia `main` toca rutas de config local
  (`.env*`, `*.local`, `.docu/`), está mal — se saca del commit antes de
  abrir el PR.
- Al cerrar la rama (merge o not planned), la config local muere con ella:
  `rm -rf .docu/rama/<slug>`. Nada de esa carpeta se extrae hacia `docs/`:
  si algo valió la pena, va por PR como documento o memoria (`ENGRAM.md`).

## Comandos

```bash
gh issue list --assignee @me                      # mis tareas
gh issue list --milestone "C1 modelo y BD"        # lo que vence en el hito
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
#8 y #6 quedan asignados. Status y fechas de #11/#41 corregidos; las 5 vistas
siguen pendientes de creación en la web (la API no las crea).

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
