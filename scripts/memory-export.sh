#!/usr/bin/env bash
# DOCU memory-export: exporta la memoria del proyecto a un archivo de revisión
# en /tmp para convertir lo valioso en docs vía PR. Nunca se commitea un export:
# la memoria indexa, el repo manda (docs/integraciones/ENGRAM.md).
set -u
cd "$(dirname "$0")/.."
command -v engram >/dev/null || { echo "FALLO: engram no instalado"; exit 1; }
salida="/tmp/docu-memory/memory-review-$(date +%F).json"
mkdir -p /tmp/docu-memory
engram export "$salida" --project docu || exit 1
echo "exportado: $salida"
echo "siguiente: revísalo, convierte lo valioso en docs con PR, borra el archivo."
