#!/bin/sh
# Mensaje convencional con descripcion util.
grep -qE "^(feat|fix|docs|chore|refactor|test|ci): .{10,}" "$1"
