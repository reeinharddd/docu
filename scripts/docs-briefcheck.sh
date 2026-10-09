#!/bin/sh
# Falla si un brief no trae el encabezado mínimo §0. Acepta Issue: o Issues:
# (los briefs duales #29/#9 y #30/#36 cubren dos issues a propósito).
set -u
cd "$(dirname "$0")/.."
out=$(mktemp)
trap 'rm -f "$out"' EXIT INT TERM
for f in docs/briefs/BRIEF-*.md; do
  for campo in '^- Issues?:' '^- Dueño:' '^- Fechas:' '^- Requisitos:' '^- Bloqueado por:'; do
    grep -qE "$campo" "$f" || echo "ESQUEMA $f falta $campo" >> "$out"
  done
done
if [ -s "$out" ]; then cat "$out"; echo "briefs: FALLA"; exit 1; fi
echo "briefs: OK"
