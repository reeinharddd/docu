---
name: docu-gestion
description: Work management conventions in DOCU on GitHub Issues - labels, milestones, sub-issues, dependencies, branches, PRs and the Definition of Done. Use before creating, moving, labeling or closing an issue, or when starting a task.
---
<!--
owner: reeinharddd
trigger: before touching an issue or starting a task
purpose: Work management conventions on GitHub Issues
-->

# Managing work in DOCU

Full source: `docs/integraciones/GITHUB-GESTION.md`. This skill is the
operational summary; if they disagree, the document wins.

## Model

| Concept | Where |
|---|---|
| Epic | Issue `tipo:epica` (#47-#53); every task hangs off one as a sub-issue |
| Task, story, research, deliverable | Issue with `tipo:*`, created from a template |
| Subtask | Sub-issue |
| Milestone with a date | Milestone |
| Epic / sprint / priority | `epica:*`, `sprint:N`, `prioridad:*` |
| Requirement | `RF-0n`, `RNF-0n`; if missing, `req:pendiente` |
| Dependency | native *blocked by* relationship |
| Schedule | `Cronograma` line in the body: `YYYY-MM-DD -> YYYY-MM-DD` |

Labels are the source of truth: `scripts/project-sync.ts` fills the Project
fields (Status, Epic, Priority, Sprint, Start, End). Never edit those fields by
hand except `Status = En progreso` when starting.
| Blocked > 24 h | `bloqueado` and escalate to the lead |

## Commands

```bash
gh issue list --assignee @me
gh issue view N
gh api repos/{owner}/{repo}/issues/N/dependencies/blocked_by
gh api repos/{owner}/{repo}/issues/N/sub_issues
gh issue develop N --base main --checkout     # branch feat/N-slug
gh pr create --base main                      # body with "Closes #N"
GH_TOKEN=$(env -u GITHUB_TOKEN gh auth token) bun run project:sync
```

## Rules

1. One person, one issue `En progreso`.
2. Branch `feat/<issue>-<slug>` from `main`. Nothing direct to `main`.
3. An issue closes only with a merged PR that says `Closes #N` (enforced by the
   `pr-issue` check; `sin-issue` only for maintenance), or with evidence in the
   closing comment.
4. Never delete issues, labels or milestones: they close as `not planned` with
   a reason.
5. Creating issues or changing another person's assignee/milestone requires the
   lead's confirmation.
6. When changing requirement labels, update `docs/gestion/TRAZABILIDAD.md` in
   the same PR.
7. Before closing: `bun run verify` green.
