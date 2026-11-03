#!/usr/bin/env bash
# DOCU rama-env: sets up the working environment for one feature branch.
# Creates feat/<issue>-<slug> from main via gh issue develop (or reuses it),
# scaffolds .docu/rama/<slug>/ with the branch's LOCAL task config (never
# committed: gitignored), and prints the checklist. The deliverable travels
# in commits; the branch config never does (GITHUB-GESTION.md §Configs de rama).
# Usage: scripts/rama-env.sh <issue>
set -euo pipefail
cd "$(dirname "$0")/.."

ISSUE="${1:-}"
[ -n "$ISSUE" ] || { echo "uso: scripts/rama-env.sh <issue>"; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "falta gh: bash scripts/setup.sh"; exit 1; }
TITLE=$(gh issue view "$ISSUE" --json title -q .title 2>/dev/null) || { echo "issue #$ISSUE no encontrado"; exit 1; }

# Slug compacto del titulo (max 4 palabras) -> feat/<issue>-<slug>
SLUG=$(printf '%s' "$TITLE" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed -e 's/^-//' -e 's/-$//' | cut -d- -f1-4)
BRANCH="feat/${ISSUE}-${SLUG}"
gh issue develop "$ISSUE" --base main --name "$BRANCH" --checkout >/dev/null 2>&1
BRANCH=$(git rev-parse --abbrev-ref HEAD)
case "$BRANCH" in
  feat/"$ISSUE"*) SLUG="${BRANCH#feat/${ISSUE}-}" ;;
  main) echo "no se pudo crear la rama (main sigue activa); revisa gh issue develop $ISSUE"; exit 1 ;;
  *) SLUG="$BRANCH" ;;
esac

WORKDIR=".docu/rama/${SLUG}"
mkdir -p "$WORKDIR"

if [ ! -f "$WORKDIR/env" ]; then
  cat > "$WORKDIR/env" <<EOF
# Config local de $BRANCH — NUNCA se commitea (esta carpeta está en .gitignore).
# Fuente antes de trabajar:  source $WORKDIR/env

export DOCU_RAMA="$SLUG"

# Infra aislada por tarea (contenedores y volúmenes propios, mismo puerto):
export COMPOSE_PROJECT_NAME="docu-${SLUG}"

# Si chocas con otra rama local en puertos, descomenta y ajusta:
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

echo "rama:      $BRANCH"
echo "workspace: $WORKDIR/ (gitignored, nunca se commitea)"
echo "siguiente:"
echo "  1. source $WORKDIR/env"
echo "  2. /tarea $ISSUE"
