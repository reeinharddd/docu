#!/bin/sh
# Conventional message with a useful description.
grep -qE "^(feat|fix|docs|chore|refactor|test|ci): .{10,}" "$1"
