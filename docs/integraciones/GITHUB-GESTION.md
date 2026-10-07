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

## Configuración pendiente (una sola vez, la hace Erik)

1. Dar al token de `gh` el scope de Projects (abre el navegador):
   `gh auth refresh -s project`
2. Invitar a los compañeros como colaboradores con su usuario de GitHub y
   asignarles sus issues (`gh issue edit N --add-assignee <usuario>`).
3. Crear el Project `DOCU` y vincularlo al repositorio, con los campos
   `Estado` (`Por hacer`, `En progreso`, `En revisión`, `Listo`), `Inicio` y
   `Fin`, y vistas Tablero, Tabla por épica y Roadmap. Activar los flujos
   integrados: issue añadido → `Por hacer`, PR fusionado → `Listo`.

## Historial

Hasta el 2026-10-06 el gestor fue Monday. Contrato y hallazgos de ese tablero:
`integraciones/MONDAY.md` (histórico, solo lectura).
