---
description: Estado actual del proyecto DOCU (git, issues, hitos, bloqueos)
dueno: reeinharddd
disparador: al pedir el estado del proyecto
proposito: Resume git, issues, hitos y bloqueos actuales
---

Git:
!`git log --oneline -8`
!`git status -sb | head -5`

Pull requests abiertos:
!`gh pr list --json number,title,author,reviewDecision --jq '.[] | "#\(.number) \(.title) (\(.author.login), \(.reviewDecision // "sin revision"))"' 2>/dev/null`

Hitos:
!`gh api repos/{owner}/{repo}/milestones --jq '.[] | "\(.due_on[:10]) \(.title): \(.open_issues) abiertos / \(.closed_issues) cerrados"' 2>/dev/null`

Bloqueados y sin requisito:
!`gh issue list --label bloqueado --json number,title --jq '.[] | "BLOQUEADO #\(.number) \(.title)"' 2>/dev/null`
!`gh issue list --label req:pendiente --json number,title --jq '.[] | "SIN RF #\(.number) \(.title)"' 2>/dev/null`

Con eso y @docs/gestion/PLAN-EPICAS.md, responde en espanol:

1. Una linea de resumen (TL;DR).
2. Tabla por epica: issues abiertos, responsable, siguiente fecha.
3. Riesgos: lo que vence en 7 dias, bloqueos, huecos de trazabilidad.
4. Que no verificaste.
