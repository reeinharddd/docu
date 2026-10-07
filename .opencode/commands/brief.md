---
description: Redactar el brief de delegacion de un issue con la plantilla oficial
---

Issue: #$1

!`gh issue view $1 --json number,title,body,labels,milestone,assignees`

Bloqueado por:
!`gh api repos/{owner}/{repo}/issues/$1/dependencies/blocked_by --jq '.[] | "#\(.number) \(.title)"' 2>/dev/null`

Redacta `docs/briefs/BRIEF-$1-<slug>.md` siguiendo exactamente @docs/plantillas/BRIEF.md:

- Toma requisitos de @docs/proyecto/REQUISITOS.md, responsables de @docs/proyecto/EQUIPO.md y fechas del hito.
- Cada entregable con evidencia verificable por un tercero en 10 minutos.
- Referencias con rutas exactas del repo, nada de "busca en Google".
- Al terminar: `bash scripts/doc-index.sh --fix` y propone el comentario para el issue con el enlace al brief. No lo publiques sin confirmacion.
