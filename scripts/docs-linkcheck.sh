#!/bin/sh
# Fails if a relative markdown link [text](path) points to a file that
# does not exist on disk. Only objective errors: http(s), mailto, pure anchors,
# note refs ([x][y]) and fenced code blocks (examples, not navigable links)
# are not checked. Style: sh + for-in, like doc-index.sh.
set -u
cd "$(dirname "$0")/.."
out=$(mktemp)
trap 'rm -f "$out"' EXIT INT TERM
for f in $(find docs README.md AGENTS.md -type f -name '*.md' 2>/dev/null); do
  dir=$(dirname "$f")
  for t in $(awk '/^```/{salta=!salta; next} !salta' "$f" | grep -o '\]([^)]*)' | sed 's/^](//;s/)$//' | cut -d'#' -f1 | grep -v '^$' | grep -v '^https\?://' | grep -v '^mailto:' | grep -v '^#'); do
    case "$t" in
      /*) [ -e ".$t" ] || echo "BROKEN $f -> $t" >> "$out" ;;
      *) [ -e "$dir/$t" ] || [ -e "$t" ] || echo "BROKEN $f -> $t" >> "$out" ;;
    esac
  done
done
if [ -s "$out" ]; then cat "$out"; echo "links: FAIL"; exit 1; fi
echo "links: OK"
