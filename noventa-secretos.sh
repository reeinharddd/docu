#!/bin/sh
# Fails if there are secret traces in what is staged.
# Patterns are assembled in pieces so this file does not flag itself.
files=$(git diff --cached --name-only)
[ -n "$files" ] || exit 0
printf '%s\n' "$files" | xargs grep -lE "BEGIN[[:space:]]+PRIVATE[[:space:]]+KEY|BEGIN[[:space:]]+RSA|ghp[_]|AKI[A]" && exit 1 || exit 0
