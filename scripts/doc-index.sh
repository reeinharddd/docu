#!/bin/sh
# The docs index is the law (docs/README.md). This script makes it verifiable:
# everything listed must exist and everything that exists must be listed.
set -u
cd "$(dirname "$0")/.."
INDICE=docs/.indice

listar() { grep -v '^[[:space:]]*#' "$INDICE" 2>/dev/null | grep -v '^[[:space:]]*$' | sed 's/[[:space:]]*$//' | sort; }
# find is used, not `git ls-files`: an unstaged document is still on disk
# and still must be listed. With git, write a doc and forget the index
# went unnoticed exactly in the window where mistakes slip in.
# Briefs of closed issues are archived in docs/briefs/historico/ and do NOT
# enter the central index (docs/README.md §Briefs): they are history, not current.
disco() { find docs -type f -name '*.md' -not -path 'docs/briefs/historico/*' | sed 's|^\./||' | sort; }

if [ "${1:-}" = "--fix" ]; then
  { echo "# Indice documental de DOCU. Fuente de verdad de docs/README.md."; echo "# Verifica con: bash scripts/doc-index.sh"; echo "# Regenera con: bash scripts/doc-index.sh --fix"; disco; } > "$INDICE"
  echo "regenerado: $(grep -vc '^#' "$INDICE") entradas"
  exit 0
fi

falta=0
for p in $(listar); do
  if [ ! -e "$p" ]; then echo "FALTA EN DISCO: $p"; falta=$((falta+1)); fi
done
for p in $(disco); do
  if ! listar | grep -qxF "$p"; then echo "HUERFANO (existe, no listado): $p"; falta=$((falta+1)); fi
done

total=$(listar | wc -l | tr -d ' ')
if [ "$falta" -gt 0 ]; then echo "indice documental: $falta discrepancia(s) sobre $total entradas"; exit 1; fi
echo "indice documental: $total entradas, 0 discrepancias"
