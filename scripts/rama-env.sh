#!/usr/bin/env bash
# DOCU rama-env: sets up the working environment for one feature branch.
# Creates feat/<issue>-<slug> from main via gh issue develop (or reuses it),
# scaffolds .docu/rama/<slug>/ with the branch's LOCAL task config (never
# committed: gitignored), and prints the checklist. The deliverable travels
# in commits; the branch config never does (GITHUB-GESTION.md §Configs de rama).
# Usage: scripts/rama-env.sh <issue> [branch-name]
set -euo pipefail
cd "$(dirname "$0")/.."

ISSUE="${1:-}"
[ -n "$ISSUE" ] || { echo "usage: scripts/rama-env.sh <issue> [branch-name]"; exit 1; }
REQUESTED_BRANCH="${2:-}"
command -v gh >/dev/null 2>&1 || { echo "gh is missing: bash scripts/setup.sh"; exit 1; }
TITLE=$(gh issue view "$ISSUE" --json title -q .title 2>/dev/null) || { echo "issue #$ISSUE not found"; exit 1; }

# Compact slug from the title (max 4 words) -> feat/<issue>-<slug>
SLUG=$(printf '%s' "$TITLE" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed -e 's/^-//' -e 's/-$//' | cut -d- -f1-4)
BRANCH="${REQUESTED_BRANCH:-feat/${ISSUE}-${SLUG}}"
case "$BRANCH" in
  feat/"$ISSUE"-*) ;;
  *) echo "branch must be feat/${ISSUE}-<slug>: $BRANCH"; exit 1 ;;
esac

if ! gh issue develop "$ISSUE" --base main --name "$BRANCH" --checkout >/dev/null 2>&1; then
  # The branch may already exist: reuse it instead of failing.
  git fetch origin "$BRANCH" >/dev/null 2>&1 || true
  git checkout "$BRANCH" >/dev/null 2>&1 || git checkout -b "$BRANCH" origin/main >/dev/null 2>&1 || true
fi
BRANCH=$(git rev-parse --abbrev-ref HEAD)
case "$BRANCH" in
  feat/"$ISSUE"*) SLUG="${BRANCH#feat/${ISSUE}-}" ;;
  main) echo "could not create the branch (main is still active); check: gh issue develop $ISSUE"; exit 1 ;;
  *) SLUG="$BRANCH" ;;
esac

WORKDIR=".docu/rama/${SLUG}"
mkdir -p "$WORKDIR"

if [ ! -f "$WORKDIR/env" ]; then
  cat > "$WORKDIR/env" <<EOF
# Local config for $BRANCH — NEVER committed (this folder is in .gitignore).
# Load it before working:  source $WORKDIR/env

export DOCU_RAMA="$SLUG"

# Infra isolated per task (own containers and volumes, same ports):
export COMPOSE_PROJECT_NAME="docu-${SLUG}"

# If you clash with another local branch on ports, uncomment and adjust:
# export PG_PORT=5433
# export REDIS_PORT=6380
# export DATABASE_URL="postgresql://docu:docu@localhost:5433/docu?schema=public"
# export REDIS_URL="redis://localhost:6380"
EOF
fi

if [ ! -f "$WORKDIR/notas.md" ]; then
  TITLE=$(gh issue view "$ISSUE" --json title -q .title)
  cat > "$WORKDIR/notas.md" <<EOF
# Notas de $BRANCH

- Issue: #$ISSUE — $TITLE
- Qué necesita esta tarea (del brief §6): MCPs opt-in, variables, corpus, etc.
- Decisiones locales que NO viajan en el commit se anotan aquí.
- Al cerrar: la config local muere con la rama; solo el entregable se mergea.
EOF
fi

echo "branch:    $BRANCH"
echo "workspace: $WORKDIR/ (gitignored, never committed)"
echo "next:"
echo "  1. source $WORKDIR/env"
echo "  2. /tarea $ISSUE"
