#!/bin/sh
# The docs index is the law (docs/README.md). This script makes it verifiable:
# everything listed must exist and everything that exists must be listed.
set -u
cd "$(dirname "$0")/.."
INDICE=docs/.indice

list_index() { grep -v '^[[:space:]]*#' "$INDICE" 2>/dev/null | grep -v '^[[:space:]]*$' | sed 's/[[:space:]]*$//' | sort; }
# find is used, not `git ls-files`: an unstaged document is still on disk
# and still must be listed. With git, write a doc and forget the index
# went unnoticed exactly in the window where mistakes slip in.
# Briefs of closed issues are archived in docs/briefs/historico/ and do NOT
# enter the central index (docs/README.md §Briefs): they are history, not current.
on_disk() { find docs -type f -name '*.md' -not -path 'docs/briefs/historico/*' | sed 's|^\./||' | sort; }

if [ "${1:-}" = "--fix" ]; then
  { echo "# Indice documental de DOCU. Fuente de verdad de docs/README.md."; echo "# Verifica con: bash scripts/doc-index.sh"; echo "# Regenera con: bash scripts/doc-index.sh --fix"; on_disk; } > "$INDICE"
  echo "regenerated: $(grep -vc '^#' "$INDICE") entries"
  exit 0
fi

missing=0
for p in $(list_index); do
  if [ ! -e "$p" ]; then echo "MISSING ON DISK: $p"; missing=$((missing+1)); fi
done
for p in $(on_disk); do
  if ! list_index | grep -qxF "$p"; then echo "ORPHAN (exists, not listed): $p"; missing=$((missing+1)); fi
done

total=$(list_index | wc -l | tr -d ' ')
if [ "$missing" -gt 0 ]; then echo "docs index: $missing mismatch(es) over $total entries"; exit 1; fi
echo "docs index: $total entries, 0 mismatches"
