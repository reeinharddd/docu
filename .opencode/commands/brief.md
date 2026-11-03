---
description: Draft the delegation brief of an issue with the official template
---
<!--
owner: reeinharddd
trigger: when delegating an issue to a person
purpose: Draft the brief with the official template
-->

Issue: #$1

!`gh issue view $1 --json number,title,body,labels,milestone,assignees`

Blocked by:
!`gh api repos/{owner}/{repo}/issues/$1/dependencies/blocked_by --jq '.[] | "#\(.number) \(.title)"' 2>/dev/null`

Write `docs/briefs/BRIEF-$1-<slug>.md` following exactly @docs/plantillas/BRIEF.md:

- Take requirements from @docs/proyecto/REQUISITOS.md, owners from @docs/proyecto/EQUIPO.md and dates from the milestone.
- Every deliverable carries evidence verifiable by a third party in 10 minutes.
- References with exact repo paths, never "search Google".
- When done: `bash scripts/doc-index.sh --fix` and propose the comment for the issue with the brief link. Do not publish it without confirmation.
