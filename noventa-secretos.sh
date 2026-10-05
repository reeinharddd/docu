#!/bin/sh
# Falla si hay huellas de secretos en lo staged.
git diff --cached --name-only | xargs grep -lE "BEGIN PRIVATE KEY|BEGIN RSA|ghp_|AKIA" && exit 1 || exit 0
