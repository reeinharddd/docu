#!/usr/bin/env bash
# DOCU tdd-gate: the TDD door (BRIEF-87, ADR-0018).
# Fails when the diff adds/changes API source code without any accompanying
# spec file. Escapes: label `sin-test` (checked by the CI workflow, not here).
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

src=$(printf '%s\n' "$files" | grep -E '^apps/api/src/.*\.ts$' | grep -v '\.spec\.ts$' || true)
spec=$(printf '%s\n' "$files" | grep -E '^apps/api/.*\.spec\.ts$' || true)

if [ -z "$src" ]; then
  echo "tdd-gate: sin codigo de API en el diff; puerta TDD no aplica."
  exit 0
fi

if [ -n "$spec" ]; then
  echo "tdd-gate: codigo de API con specs en el diff:"
  printf '%s\n' "$spec" | sed 's/^/  ok: /'
  exit 0
fi

msg="tdd-gate: codigo de API sin ningun test en el diff:"
printf '%s\n' "$src" | sed 's/^/  falta test: /'
if [ "$mode" = "aviso" ]; then
  echo "$msg (aviso: recuerda el test rojo antes del verde; si es intencional, etiqueta sin-test en el PR)" >&2
  exit 0
fi
echo "$msg" >&2
echo '  Regla: test rojo antes del codigo verde (ADR-0018). Si no aplica, etiqueta `sin-test` en el PR con motivo.' >&2
exit 1
