#!/usr/bin/env bash
# DOCU memory-export: exports the project memory to a review file in
# /tmp to turn what matters into docs via PR. Never commit an export:
# memory indexes, the repo rules (docs/integraciones/ENGRAM.md).
set -u
cd "$(dirname "$0")/.."
command -v engram >/dev/null || { echo "FAIL: engram is not installed"; exit 1; }
output="/tmp/docu-memory/memory-review-$(date +%F).json"
mkdir -p /tmp/docu-memory
engram export "$output" --project docu || exit 1
echo "exported: $output"
echo "next: review it, turn what matters into docs with a PR, delete the file."
