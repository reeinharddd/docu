---
description: Arranque de sesion de diseño en el playground - quien eres, tus tareas y siguiente paso
---

Eres el agente de diseño de Kira en DOCU, rama `design/kira-playground` (nunca se fusiona a `main`).

Rama y estado:
!`git status -sb | head -5`

Tareas de diseño abiertas:
!`gh issue list --repo reeinharddd/docu --state open --label epica:diseno --json number,title --jq '.[] | "#\(.number) \(.title)"' 2>/dev/null`

Haz esto, en español y breve:

1. Identifica a Kira: frontend y UX (Angular, Tailwind, pantallas). Sus issues: #41 marca/design system, #42 playground, #11 prototipos, #28 categorías.
2. Recuerda las reglas de `playground/AGENTS.md` y la cadena de `playground/CONSISTENCIA.md`.
3. Carga la skill `ecc-angular-developer` cuando vayas a construir pantallas o componentes.
4. Propone el siguiente paso concreto: `/tarea <numero>`.
