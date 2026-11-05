#!/usr/bin/env bash
# DOCU tdd-gate: the TDD door (BRIEF-87, ADR-0018).
# Fails when the diff adds/changes source code (API or dataset generator)
# without any accompanying spec file. Escapes: label `sin-test` (checked by
# the CI workflow, not here).
# Modes:
#   tdd-gate.sh [base]     CI mode: diff base...HEAD (default origin/main)
#   tdd-gate.sh --aviso    pre-commit mode: checks STAGED files, warns, never fails
#   tdd-gate.sh --stdin    demo/test mode: reads the file list from stdin
# Output: 0 = ok, 1 = code without tests found.
set -u

mode="ci"
base="origin/main"
for arg in "$@"; do
  case "$arg" in
    --aviso) mode="aviso" ;;
    --stdin) mode="stdin" ;;
    *) base="$arg" ;;
  esac
done

case "$mode" in
  ci)     files=$(git diff --name-only "$base"...HEAD 2>/dev/null) ;;
  aviso)  files=$(git diff --cached --name-only 2>/dev/null) ;;
  stdin)  files=$(cat) ;;
esac

src=$(printf '%s\n' "$files" | grep -E '^(apps/api/src|dataset)/.*\.ts$' | grep -v '\.spec\.ts$' || true)
spec=$(printf '%s\n' "$files" | grep -E '^(apps/api|dataset)/.*\.spec\.ts$' || true)

if [ -z "$src" ]; then
  echo "tdd-gate: no API or generator code in the diff; TDD gate does not apply."
  exit 0
fi

if [ -n "$spec" ]; then
  echo "tdd-gate: code with specs in the diff:"
  printf '%s\n' "$spec" | sed 's/^/  ok: /'
  exit 0
fi

msg="tdd-gate: code without any test in the diff:"
printf '%s\n' "$src" | sed 's/^/  missing test: /'
if [ "$mode" = "aviso" ]; then
  echo "$msg (warning: red test before green code; if intentional, label the PR sin-test with the reason)" >&2
  exit 0
fi
echo "$msg" >&2
echo '  Rule: red test before green code (ADR-0018). If it does not apply, label the PR `sin-test` with the reason.' >&2
exit 1
