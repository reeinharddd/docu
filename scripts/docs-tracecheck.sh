#!/bin/sh
# Falla si un RF/RNF citado en briefs/gestión/equipo no está definido en
# REQUISITOS.md, o si el índice documental está desactualizado.
set -u
cd "$(dirname "$0")/.."
out=$(mktemp)
trap 'rm -f "$out"' EXIT INT TERM
for id in $(grep -rhoE 'R(N)?F-[0-9]+' docs/briefs docs/gestion docs/proyecto/EQUIPO.md 2>/dev/null | sort -u); do
  grep -q "$id" docs/proyecto/REQUISITOS.md || echo "RF-HUERFANO $id sin definir en REQUISITOS.md" >> "$out"
done
bash scripts/doc-index.sh >/dev/null || { echo "trace: índice desactualizado"; exit 1; }
if [ -s "$out" ]; then cat "$out"; echo "trace: FALLA"; exit 1; fi
echo "trace: OK"
