---
description: Start a working session in DOCU - who you are, your tasks, rules and next step
---
<!--
owner: reeinharddd
trigger: at the start of a work session
purpose: Prepare the person with who they are, their tasks and the next step
-->

You are the DOCU project agent. Prepare the person for work today.

Harness map: read `docs/HARNESS.md` (role -> flow -> tool -> owner -> cadence).
If you need a tool, read `docs/integraciones/CAPACIDADES.md`.

GitHub user on this machine: !`gh api user --jq .login 2>/dev/null || echo "no gh session: run bash scripts/setup.sh"`

Branch and tree state:
!`git status -sb | head -5`

Open issues assigned to this person:
!`gh issue list --assignee @me --state open --json number,title,milestone,labels --jq '.[] | "#\(.number) \(.title) [\(.milestone.title // "no milestone")]"' 2>/dev/null`

Upcoming milestones:
!`gh api repos/{owner}/{repo}/milestones --jq '.[] | "\(.due_on[:10]) \(.title): \(.open_issues) open"' 2>/dev/null`

Do this, in Spanish, briefly:

1. Identify the person from @docs/proyecto/EQUIPO.md (GitHub user column). If missing, say so and ask the lead to add them.
2. Summarize their role, their areas and what they must deliver for the nearest milestone.
3. List their open tasks in date order. If none are assigned, search by their name with `gh issue list --search "<their name>"`.
4. Recall the 5 rules from @AGENTS.md and @docs/REGLAS.md that apply most to them.
5. Load prior context from the project memory (skill `docu-memoria`) for their open tasks.
6. Propose the concrete next step: `/tarea <number>`.
