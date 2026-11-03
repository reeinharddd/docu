#!/usr/bin/env bash
# DOCU memory-export: exports the project memory to a review file in
# /tmp to turn what matters into docs via PR. Never commit an export:
# memory indexes, the repo rules (docs/integraciones/ENGRAM.md).
set -u
cd "$(dirname "$0")/.."
command -v engram >/dev/null || { echo "FALLO: engram no instalado"; exit 1; }
salida="/tmp/docu-memory/memory-review-$(date +%F).json"
mkdir -p /tmp/docu-memory
engram export "$salida" --project docu || exit 1
echo "exportado: $salida"
echo "siguiente: revísalo, convierte lo valioso en docs con PR, borra el archivo."
