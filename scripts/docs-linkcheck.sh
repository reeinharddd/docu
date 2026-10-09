#!/bin/sh
# Falla si un enlace markdown relativo [texto](ruta) apunta a un archivo que
# no existe en disco. Solo errores objetivos: http(s), mailto, anclas puras,
# refs de nota ([x][y]) y bloques de código cercados (ejemplos, no enlaces
# navegables) no se revisan. Estilo: sh + for-in, como doc-index.sh.
set -u
cd "$(dirname "$0")/.."
out=$(mktemp)
trap 'rm -f "$out"' EXIT INT TERM
for f in $(find docs README.md AGENTS.md -type f -name '*.md' 2>/dev/null); do
  dir=$(dirname "$f")
  for t in $(awk '/^```/{salta=!salta; next} !salta' "$f" | grep -o '\]([^)]*)' | sed 's/^](//;s/)$//' | cut -d'#' -f1 | grep -v '^$' | grep -v '^https\?://' | grep -v '^mailto:' | grep -v '^#'); do
    case "$t" in
      /*) [ -e ".$t" ] || echo "ROTO $f -> $t" >> "$out" ;;
      *) [ -e "$dir/$t" ] || [ -e "$t" ] || echo "ROTO $f -> $t" >> "$out" ;;
    esac
  done
done
if [ -s "$out" ]; then cat "$out"; echo "links: FALLA"; exit 1; fi
echo "links: OK"
