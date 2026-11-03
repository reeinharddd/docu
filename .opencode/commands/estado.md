---
description: Current state of the DOCU project (git, issues, milestones, blockers)
---
<!--
owner: reeinharddd
trigger: when asking for the project state
purpose: Summarize git, issues, milestones and current blockers
-->

Git:
!`git log --oneline -8`
!`git status -sb | head -5`

Open pull requests:
!`gh pr list --json number,title,author,reviewDecision --jq '.[] | "#\(.number) \(.title) (\(.author.login), \(.reviewDecision // "no review"))"' 2>/dev/null`

Milestones:
!`gh api repos/{owner}/{repo}/milestones --jq '.[] | "\(.due_on[:10]) \(.title): \(.open_issues) open / \(.closed_issues) closed"' 2>/dev/null`

Blocked and without requirement:
!`gh issue list --label bloqueado --json number,title --jq '.[] | "BLOCKED #\(.number) \(.title)"' 2>/dev/null`
!`gh issue list --label req:pendiente --json number,title --jq '.[] | "NO RF #\(.number) \(.title)"' 2>/dev/null`

With that and @docs/gestion/PLAN-EPICAS.md, answer in Spanish:

1. One-line summary (TL;DR).
2. Table by epic: open issues, owner, next date.
3. Risks: what is due within 7 days, blockers, traceability gaps.
4. What you did not verify.
