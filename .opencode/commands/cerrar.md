---
description: Cerrar el trabajo de la rama actual - verify, commit convencional y PR que cierra el issue
dueno: reeinharddd
disparador: al terminar el trabajo de la rama
proposito: Verifica, commitea convencional y abre el PR que cierra el issue
---

Rama: !`git rev-parse --abbrev-ref HEAD`
Cambios:
!`git status -s`

Pasos, en orden, sin saltar ninguno:

1. Si la rama es `main`, para: nada se trabaja directo en `main`.
2. Corre `bun run verify`. Si falla, corrige y repite. No sigas en rojo.
3. Si tocaste `docs/`, corre `bash scripts/doc-index.sh` y, si falla, `--fix`.
4. Muestra el diff resumido y propone un mensaje de commit convencional en espanol (`feat:`, `fix:`, `docs:`, `chore:`), sin atribucion a IA. Un cambio logico por commit. Espera confirmacion para commitear.
5. Con confirmacion: `git push -u origin HEAD` y `gh pr create --base main` con cuerpo segun @.github/PULL_REQUEST_TEMPLATE.md, incluyendo `Closes #<issue>` (el numero sale del nombre de la rama) y la evidencia.
6. Pide revisor: `gh pr edit --add-reviewer <usuario>` con alguien de @docs/proyecto/EQUIPO.md distinto al autor.
7. Si el revisor (humano o subagente `revisor`) pide cambios: corrige en la misma rama, repite desde el paso 2, haz push y responde cada hallazgo en el PR. No abras otro PR. Solo se cierra el issue con aprobación.
