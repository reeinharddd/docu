#!/usr/bin/env bash
# backup.sh — backup of the two things DOCU cannot lose: the code and the data.
#
# What it produces (default: backups/<UTC timestamp>/):
#
#   app.bundle   git bundle with every ref of the repository. Restoring it
#                gives back the exact code that produced the dump.
#   db.dump      pg_dump in custom format (-Fc): the schema and the data of
#                the installation, restorable with pg_restore.
#   manifest.txt what was backed up, when, how big and with which SHA-256.
#
# The dump holds the data of the plant (document text, proposals, sessions):
# it must live outside the repository. `backups/` is git-ignored for that
# reason, and the operator is expected to copy it to the offsite copy.
#
# Usage:
#   scripts/backup.sh [--out DIR] [--label TEXT]
#
# Environment:
#   DATABASE_URL   connection string; defaults to the one in .env
#   BACKUP_DIR     root directory for the backups; defaults to ./backups
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT=$(pwd)

OUT=""
LABEL=""
while [ $# -gt 0 ]; do
  case "$1" in
  --out)
    OUT="$2"
    shift 2
    ;;
  --label)
    LABEL="$2"
    shift 2
    ;;
  -h | --help)
    sed -n '2,25p' "$0"
    exit 0
    ;;
  *)
    echo "unknown argument: $1" >&2
    exit 2
    ;;
  esac
done

# --- configuration -----------------------------------------------------------

if [ -z "${DATABASE_URL:-}" ] && [ -f .env ]; then
  DATABASE_URL=$(grep -E '^DATABASE_URL=' .env | head -1 | cut -d= -f2-)
fi
if [ -z "${DATABASE_URL:-}" ]; then
  echo "backup: DATABASE_URL is not set (and .env does not define it)" >&2
  exit 1
fi
# The schema query parameter is for Prisma, not for the PostgreSQL CLI tools.
PG_URL="${DATABASE_URL%%\?*}"
DB_NAME=$(printf '%s' "$PG_URL" | sed -E 's#.*/([^/?]+)$#\1#')

STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT="${OUT:-${BACKUP_DIR:-$ROOT/backups}/$STAMP}"
mkdir -p "$OUT"

# --- code --------------------------------------------------------------------

git bundle create "$OUT/app.bundle" --all >/dev/null
COMMIT=$(git rev-parse HEAD)
TREE=$(git rev-parse 'HEAD^{tree}')

# --- data --------------------------------------------------------------------

pg_dump --format=custom --no-owner --no-privileges --file="$OUT/db.dump" "$PG_URL"

# --- manifest ----------------------------------------------------------------

DB_SHA=$(sha256sum "$OUT/db.dump" | cut -d' ' -f1)
APP_SHA=$(sha256sum "$OUT/app.bundle" | cut -d' ' -f1)
DB_SIZE=$(stat -c%s "$OUT/db.dump")
APP_SIZE=$(stat -c%s "$OUT/app.bundle")

{
  echo "backup_at_utc=$STAMP"
  [ -n "$LABEL" ] && echo "label=$LABEL"
  echo "database=$DB_NAME"
  echo "commit=$COMMIT"
  echo "tree=$TREE"
  echo "db_file=db.dump"
  echo "db_sha256=$DB_SHA"
  echo "db_bytes=$DB_SIZE"
  echo "app_file=app.bundle"
  echo "app_sha256=$APP_SHA"
  echo "app_bytes=$APP_SIZE"
} >"$OUT/manifest.txt"

echo "backup: written to $OUT"
cat "$OUT/manifest.txt"
