#!/bin/sh
# Checks the live harness metadata: every piece (command, subagent, own or
# vendored skill) declares owner, trigger and purpose; vendored pieces also
# origin and version. Metadata lives in the frontmatter or, if the runtime
# rejects it (unknown fields are routed into options and sent to the API
# provider), in an <!-- --> block right after the frontmatter. Fails if a
# field is missing or the owner does not exist in docs/proyecto/EQUIPO.md.
# Registry: docs/HARNESS.md and docs/integraciones/CAPACIDADES.md.
set -u
cd "$(dirname "$0")/.."

TEAM=docs/proyecto/EQUIPO.md
findings=0
total=0

frontmatter() {
  awk '
    /^---[[:space:]]*$/ { c++; next }
    c == 1 { print; next }
    /<!--/ { h = 1; next }
    /-->/ { h = 0; next }
    h { print }
  ' "$1"
}

report() { echo "FINDING: $1: $2"; findings=$((findings+1)); }

check_piece() {
  piece=$1
  vendor=$2
  total=$((total+1))
  block=$(frontmatter "$piece")
  if [ -z "$block" ]; then
    report "$piece" "no frontmatter"
    return
  fi
  for field in owner trigger purpose; do
    printf '%s\n' "$block" | grep -q "^$field:" || report "$piece" "missing $field"
  done
  if [ "$vendor" = 1 ]; then
    printf '%s\n' "$block" | grep -q "^metadata:" || report "$piece" "missing metadata (vendor)"
    for field in repo commit version; do
      printf '%s\n' "$block" | grep -q "^  $field:" || report "$piece" "missing metadata.$field (vendor)"
    done
  fi
  owner=$(printf '%s\n' "$block" | sed -n 's/^owner:[[:space:]]*//p')
  if [ -n "$owner" ] && ! grep -qF "$owner" "$TEAM"; then
    report "$piece" "owner '$owner' does not exist in EQUIPO.md"
  fi
}

is_vendor() {
  case "$1" in
    .opencode/skills/vendor/*) return 0 ;;
    *) return 1 ;;
  esac
}

discover() {
  find .opencode/commands -type f -name '*.md' 2>/dev/null
  find .opencode/agents -type f -name '*.md' 2>/dev/null
  find .opencode/skills -mindepth 2 -maxdepth 2 -type f -name 'SKILL.md' 2>/dev/null
  find .opencode/skills/vendor -mindepth 2 -maxdepth 2 -type f -name 'SKILL.md' 2>/dev/null
}

discovered=$(discover | sort -u)
for piece in $discovered; do
  if is_vendor "$piece"; then check_piece "$piece" 1; else check_piece "$piece" 0; fi
done

INDEX=docs/integraciones/CAPACIDADES.md
if [ -f "$INDEX" ]; then
  in_index=$(grep -o '^| `\.opencode/[^`]*`' "$INDEX" | sed 's/^| `//; s/`$//' | sort -u)
  for piece in $discovered; do
    printf '%s\n' "$in_index" | grep -qxF "$piece" || report "$piece" "not listed in CAPACIDADES.md (orphan)"
  done
  for piece in $in_index; do
    [ -e "$piece" ] || report "$piece" "listed in CAPACIDADES.md but missing on disk (ghost)"
  done
else
  report "$INDEX" "missing (live harness index)"
fi

if [ "$findings" -gt 0 ]; then
  echo "harness-check: $findings finding(s) over $total pieces"
  exit 1
fi
echo "harness: $total pieces, 0 findings"
