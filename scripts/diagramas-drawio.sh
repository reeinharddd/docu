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
  echo "drawio: FAIL — docker is not available" >&2
  exit 1
fi

seen=0
for f in docs/ingenieria/*.drawio; do
  [ -e "$f" ] || continue
  seen=$((seen + 1))
  base=$(basename "$f" .drawio)
  pages=$(grep -o '<diagram[ >]' "$f" | wc -l | tr -d ' ')
  i=1
  while [ "$i" -le "$pages" ]; do
    docker run --rm -v "$PWD/docs/ingenieria:/data" "$IMG" \
      -x -f svg -p "$i" \
      -o "/data/diagramas/$base-$i.svg" "/data/$(basename "$f")" >/dev/null
    # draw.io generates a random id per export (`ge-svg-<random>`): without
    # normalizing it, two exports of the same .drawio are not equal and CI
    # would fail every time. It is pinned to a stable id so the SVG is
    # reproducible byte for byte.
    sed -i 's/ge-svg-[A-Za-z0-9_-]*/ge-svg-diagram/g' "docs/ingenieria/diagramas/$base-$i.svg"
    echo "drawio: $f page $i -> docs/ingenieria/diagramas/$base-$i.svg"
    i=$((i + 1))
  done
done

[ "$seen" -gt 0 ] || echo "drawio: no .drawio in docs/ingenieria/"
echo "drawio: $seen source(s) exported"
