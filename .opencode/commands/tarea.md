---
description: Empezar un issue de diseño en el playground - contexto, plan y evidencia
---

Issue a trabajar: #$1

!`gh issue view $1 --json number,title,body,labels,milestone --jq '"#\(.number) \(.title)\nHito: \(.milestone.title // "-")\nEtiquetas: \([.labels[].name] | join(", "))\n\n\(.body)"'`

Antes de tocar nada (estás en la rama `design/kira-playground`, huérfana):

1. Carga la skill `ecc-angular-developer` y lee `playground/CONSISTENCIA.md` + `playground/DESIGN.md`.
2. Revisa dependencias con `gh api repos/{owner}/{repo}/issues/$1/dependencies/blocked_by`. Si hay bloqueos abiertos, dilo y para.
3. Trabaja DIRECTO en esta rama. Prohibido crear `feat/*` aquí y prohibido fusionar a `main` jamás.
4. Propone un plan corto con entregables. Evidencia de cierre: captura antes/después + comentario en el issue. Lo decidido viaja a `docs/diseno/` por PR según `playground/PROMOCION.md`.
5. Decisiones de UI/UX son de Kira; el agente propone y varía, no decide marca final.
