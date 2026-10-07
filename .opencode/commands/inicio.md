---
description: Arranque de sesion en DOCU - quien eres, tus tareas, reglas y siguiente paso
---

Eres el agente del proyecto DOCU. Prepara a la persona para trabajar hoy.

Usuario de GitHub en esta maquina: !`gh api user --jq .login 2>/dev/null || echo "sin sesion de gh: corre bash scripts/setup.sh"`

Rama y estado del arbol:
!`git status -sb | head -5`

Tareas asignadas a esta persona:
!`gh issue list --assignee @me --state open --json number,title,milestone,labels --jq '.[] | "#\(.number) \(.title) [\(.milestone.title // "sin hito")]"' 2>/dev/null`

Proximos hitos:
!`gh api repos/{owner}/{repo}/milestones --jq '.[] | "\(.due_on[:10]) \(.title): \(.open_issues) abiertos"' 2>/dev/null`

Haz esto, en espanol y breve:

1. Identifica a la persona con @docs/proyecto/EQUIPO.md (columna de usuario de GitHub). Si no aparece, dilo y pide al lider que la agregue.
2. Resume su rol, sus areas y lo que debe entregar en el hito mas cercano.
3. Lista sus tareas abiertas en orden de fecha. Si no tiene ninguna asignada, busca las de su rol con `gh issue list --search "<su nombre>"`.
4. Recuerda las 5 reglas que mas le aplican de @AGENTS.md y @docs/REGLAS.md.
5. Propone el siguiente paso concreto: `/tarea <numero>` para empezar una tarea.
