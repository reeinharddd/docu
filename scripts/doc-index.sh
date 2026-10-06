#!/bin/sh
# El indice de docs es la ley (docs/README.md). Este script lo hace verificable:
# todo lo listado debe existir y todo lo que existe debe estar listado.
set -u
cd "$(dirname "$0")/.."
INDICE=docs/.indice

listar() { grep -v '^[[:space:]]*#' "$INDICE" 2>/dev/null | grep -v '^[[:space:]]*$' | sed 's/[[:space:]]*$//' | sort; }
disco() { git ls-files 'docs/*.md' 'docs/**/*.md' | sort; }

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
