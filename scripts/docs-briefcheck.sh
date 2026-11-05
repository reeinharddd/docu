#!/bin/sh
# Fails if a brief is missing the minimum §0 header. Accepts Issue: or Issues:.
# Each brief covers one issue (one deliverable); #13 absorbs #30/#36 on purpose.
# The field names stay in Spanish: they are the brief headings, not code.
set -u
cd "$(dirname "$0")/.."
out=$(mktemp)
trap 'rm -f "$out"' EXIT INT TERM
for f in docs/briefs/BRIEF-*.md; do
  for campo in '^- Issues?:' '^- Dueño:' '^- Fechas:' '^- Requisitos:' '^- Bloqueado por:'; do
    grep -qE "$campo" "$f" || echo "SCHEMA $f missing $campo" >> "$out"
  done
done
if [ -s "$out" ]; then cat "$out"; echo "briefs: FAIL"; exit 1; fi
echo "briefs: OK"
