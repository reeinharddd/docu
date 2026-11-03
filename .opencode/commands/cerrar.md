---
description: Close the current branch's work - verify, conventional commit and a PR that closes the issue
---
<!--
owner: reeinharddd
trigger: when the branch's work is finished
purpose: Verify, commit conventionally and open the PR that closes the issue
-->

Branch: !`git rev-parse --abbrev-ref HEAD`
Changes:
!`git status -s`

Steps, in order, none skipped:

1. If the branch is `main`, stop: nothing is worked on directly on `main`.
2. Run `bun run verify`. If it fails, fix and repeat. Do not proceed on red.
3. Run `bash scripts/harness-check.sh`; if you touched `docs/`, also run `bash scripts/doc-index.sh` and, if it fails, `--fix`.
4. Show the summarized diff and propose a conventional commit message in Spanish (`feat:`, `fix:`, `docs:`, `chore:`), with no AI attribution. One logical change per commit. Wait for confirmation to commit.
5. With confirmation: `git push -u origin HEAD` and `gh pr create --base main` with the body per @.github/PULL_REQUEST_TEMPLATE.md, including `Closes #<issue>` (read the number from the branch name) and the evidence.
6. Ask for a reviewer: `gh pr edit --add-reviewer <user>` with someone from @docs/proyecto/EQUIPO.md other than the author.
7. If the reviewer (human or `revisor` subagent) requests changes: fix on the same branch, repeat from step 2, push, and answer every finding on the PR. Do not open another PR. The issue closes only with approval.
8. Before finishing the session, save to memory what was costly to find out (skill `docu-memoria`, section "When closing").
