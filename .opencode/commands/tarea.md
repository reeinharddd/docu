---
description: Empezar a trabajar un issue - lee contexto, crea la rama y propone plan
dueno: reeinharddd
disparador: al empezar a trabajar un issue
proposito: Lee contexto, crea la rama y propone plan
---

Issue a trabajar: #$1

!`gh issue view $1 --json number,title,body,labels,milestone,assignees --jq '"#\(.number) \(.title)\nHito: \(.milestone.title // "-")\nEtiquetas: \([.labels[].name] | join(", "))\nAsignado: \([.assignees[].login] | join(", "))\n\n\(.body)"'`

Antes de tocar nada:

1. Carga las skills `docu-gestion` y `docu-memoria` (busca en memoria contexto previo del tema). Para descubrir, delega al subagente `explorador`.
2. Revisa dependencias: `gh api repos/{owner}/{repo}/issues/$1/dependencies/blocked_by --jq '.[] | "#\(.number) \(.state) \(.title)"'`. Si hay bloqueos abiertos, dilo y para.
3. Lee solo los documentos que el issue toque (requisitos en @docs/proyecto/REQUISITOS.md, decisiones en `docs/decisiones/`).
4. Recuerda la regla E1: sin logica de negocio en `apps/` hasta que exista design system y modelo de datos. Si el issue la pide, avisa.
5. Si el arbol esta limpio y estas en `main`, crea la rama ligada al issue: `gh issue develop $1 --base main --checkout` (nombre `feat/$1-<slug>`).
6. Propone un plan corto con entregables y la evidencia que cerrara el issue. Espera confirmacion antes de implementar. Al cerrar, guarda en memoria lo que costo averiguar segun `docu-memoria`. Antes de `/cerrar`, delega la revisión al subagente `revisor`.
