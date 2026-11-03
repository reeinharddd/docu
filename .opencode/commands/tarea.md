---
description: Start work on an issue - read context, create the branch and propose a plan
---
<!--
owner: reeinharddd
trigger: when starting work on an issue
purpose: Read context, create the branch and propose a plan
-->

Issue to work on: #$1

!`gh issue view $1 --json number,title,body,labels,milestone,assignees --jq '"#\(.number) \(.title)\nMilestone: \(.milestone.title // "-")\nLabels: \([.labels[].name] | join(", "))\nAssigned: \([.assignees[].login] | join(", "))\n\n\(.body)"'`

Before touching anything:

1. Load skills `docu-gestion` and `docu-memoria` (search memory for prior context on the topic). For discovery, delegate to the `explorador` subagent.
2. Check dependencies: `gh api repos/{owner}/{repo}/issues/$1/dependencies/blocked_by --jq '.[] | "#\(.number) \(.state) \(.title)"'`. If any blockers are open, say so and stop.
3. Read only the documents the issue touches (requirements in @docs/proyecto/REQUISITOS.md, decisions in `docs/decisiones/`).
4. Recall the E1 rule: no business logic in `apps/` until the design system and data model exist. If the issue asks for it, warn.
5. If the tree is clean and you are on `main`, create the branch bound to the issue: `gh issue develop $1 --base main --checkout` (name `feat/$1-<slug>`).
6. Propose a short plan with deliverables and the evidence that closes the issue. Wait for confirmation before implementing. When closing, save to memory what was costly to find out, per `docu-memoria`. Before `/cerrar`, delegate the review to the `revisor` subagent.
