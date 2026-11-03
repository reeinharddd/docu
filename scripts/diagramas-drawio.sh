#!/bin/sh
# Exports each page of every docs/ingenieria/*.drawio to a derived SVG in
# docs/ingenieria/diagramas/<base>-<page>.svg, using draw.io Desktop headless
# inside Docker. It reproduces what app.diagrams.net shows, so the committed
# SVG does not depend on the editor's machine. Standard: DIAGRAMAS.md §4
# (ADR-0017). Requires Docker; if absent it does not run (not part of `verify`).
set -eu
cd "$(dirname "$0")/.."

IMG="${DRAWIO_IMAGE:-rlespinasse/drawio-desktop-headless:latest}"

if ! command -v docker >/dev/null 2>&1; then
  echo "drawio: FALLA — docker no está disponible" >&2
  exit 1
fi

vistos=0
for f in docs/ingenieria/*.drawio; do
  [ -e "$f" ] || continue
  vistos=$((vistos + 1))
  base=$(basename "$f" .drawio)
  paginas=$(grep -o '<diagram[ >]' "$f" | wc -l | tr -d ' ')
  i=1
  while [ "$i" -le "$paginas" ]; do
    docker run --rm -v "$PWD/docs/ingenieria:/data" "$IMG" \
      -x -f svg -p "$i" \
      -o "/data/diagramas/$base-$i.svg" "/data/$(basename "$f")" >/dev/null
    # draw.io genera un id aleatorio por export (`ge-svg-<random>`): sin
    # normalizarlo, dos exports del mismo .drawio no son iguales y la CI
    # fallaría siempre. Se fija a un id estable para que el SVG sea
    # reproducible byte a byte.
    sed -i 's/ge-svg-[A-Za-z0-9_-]*/ge-svg-diagram/g' "docs/ingenieria/diagramas/$base-$i.svg"
    echo "drawio: $f página $i -> docs/ingenieria/diagramas/$base-$i.svg"
    i=$((i + 1))
  done
done

[ "$vistos" -gt 0 ] || echo "drawio: no hay .drawio en docs/ingenieria/"
echo "drawio: $vistos fuente(s) exportadas"
