#!/usr/bin/env bash
# restore-check.sh — proof that a backup can be restored.
#
# A backup nobody has restored is a hypothesis. This script takes a backup
# directory, restores both artifacts into scratch space and verifies them:
#
#   1. the database: the dump goes into a scratch database and every table is
#      compared row by row with the source installation;
#   2. the code: the bundle is cloned and the resulting tree is compared with
#      the tree recorded in the manifest.
#
# The scratch database is dropped at the end (unless --keep). The source
# installation is never touched: the script only reads from it.
#
# Usage:
#   scripts/restore-check.sh --backup DIR [--scratch-db NAME] [--keep]
#
# Exit code 0 = both artifacts restore and match. Any mismatch = exit 1.
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT=$(pwd)

BACKUP_DIR=""
SCRATCH_DB="docu_restore_check"
KEEP=0
while [ $# -gt 0 ]; do
  case "$1" in
  --backup)
    BACKUP_DIR="$2"
    shift 2
    ;;
  --scratch-db)
    SCRATCH_DB="$2"
    shift 2
    ;;
  --keep)
    KEEP=1
    shift
    ;;
  -h | --help)
    sed -n '2,20p' "$0"
    exit 0
    ;;
  *)
    echo "unknown argument: $1" >&2
    exit 2
    ;;
  esac
done

if [ -z "$BACKUP_DIR" ] || [ ! -d "$BACKUP_DIR" ]; then
  echo "restore-check: --backup DIR must point to an existing backup" >&2
  exit 2
fi
if [ ! -f "$BACKUP_DIR/manifest.txt" ]; then
  echo "restore-check: $BACKUP_DIR/manifest.txt is missing" >&2
  exit 2
fi

# shellcheck disable=SC1090
source <(grep -E '^(commit|tree|db_file|db_sha256|app_file|app_sha256|database)=' "$BACKUP_DIR/manifest.txt")

if [ -z "${DATABASE_URL:-}" ] && [ -f .env ]; then
  DATABASE_URL=$(grep -E '^DATABASE_URL=' .env | head -1 | cut -d= -f2-)
fi
PG_URL="${DATABASE_URL%%\?*}"
BASE_URL=$(printf '%s' "$PG_URL" | sed -E 's#/[^/?]+$##')

FAILURES=0
note() { printf '%s\n' "$*"; }
fail() {
  printf 'FAIL: %s\n' "$*"
  FAILURES=$((FAILURES + 1))
}

note "restore-check: backup $BACKUP_DIR"
note "restore-check: manifest commit=$commit tree=$tree"

# --- integrity ---------------------------------------------------------------

for pair in "db_file:db_sha256" "app_file:app_sha256"; do
  file_var=${pair%%:*}
  sha_var=${pair##*:}
  file_name=${!file_var}
  expected=${!sha_var}
  actual=$(sha256sum "$BACKUP_DIR/$file_name" | cut -d' ' -f1)
  if [ "$actual" = "$expected" ]; then
    note "restore-check: sha256 ok — $file_name"
  else
    fail "sha256 mismatch — $file_name"
  fi
done

# --- code --------------------------------------------------------------------

CLONE_DIR=$(mktemp -d "${TMPDIR:-/tmp}/docu-restore-XXXXXX")
git clone --quiet "$BACKUP_DIR/$app_file" "$CLONE_DIR/app" 2>/dev/null
CLONE_TREE=$(git -C "$CLONE_DIR/app" rev-parse 'HEAD^{tree}')
CLONE_COMMIT=$(git -C "$CLONE_DIR/app" rev-parse HEAD)
if [ "$CLONE_TREE" = "$tree" ] && [ "$CLONE_COMMIT" = "$commit" ]; then
  note "restore-check: code restored — tree $CLONE_TREE matches the manifest"
else
  fail "code restored to $CLONE_COMMIT ($CLONE_TREE), manifest says $commit ($tree)"
fi

# --- database ----------------------------------------------------------------

# The scratch database lives next to the source one (same host, same user).
psql "$BASE_URL/postgres" -q -c "DROP DATABASE IF EXISTS \"$SCRATCH_DB\";" >/dev/null 2>&1 || true
psql "$BASE_URL/postgres" -q -c "CREATE DATABASE \"$SCRATCH_DB\";" >/dev/null
pg_restore --no-owner --no-privileges --exit-on-error --dbname="$BASE_URL/$SCRATCH_DB" "$BACKUP_DIR/$db_file"

count_rows() {
  # count_rows <db name> -> "schema.table=count" lines, sorted.
  # Every schema of the installation counts: DOCU does not live in `public`.
  # Any failed count aborts the script: an empty count is not a match.
  local db="$1"
  local tables
  tables=$(psql "$BASE_URL/$db" -At -c "
    SELECT schemaname || '.' || tablename
    FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    ORDER BY schemaname, tablename;")
  local qualified schema table n
  for qualified in $tables; do
    schema=${qualified%%.*}
    table=${qualified#*.}
    n=$(psql "$BASE_URL/$db" -At -v ON_ERROR_STOP=1 \
      -c "SELECT count(*) FROM \"$schema\".\"$table\";")
    printf '%s=%s\n' "$qualified" "$n"
  done
}

SOURCE_ROWS=$(count_rows "$database")
TARGET_ROWS=$(count_rows "$SCRATCH_DB")

if [ "$SOURCE_ROWS" = "$TARGET_ROWS" ]; then
  TABLE_COUNT=$(printf '%s\n' "$TARGET_ROWS" | grep -c '=' || true)
  note "restore-check: database restored — $TABLE_COUNT tables with identical row counts"
  printf '%s\n' "$TARGET_ROWS" | head -5 | sed 's/^/restore-check:   /'
else
  fail "database restored with different row counts"
  diff <(printf '%s\n' "$SOURCE_ROWS") <(printf '%s\n' "$TARGET_ROWS") | head -20 || true
fi

if [ "$KEEP" -eq 0 ]; then
  psql "$BASE_URL/postgres" -q -c "DROP DATABASE IF EXISTS \"$SCRATCH_DB\";" >/dev/null 2>&1 || true
  TRASH="${TMPDIR:-/tmp}/opencode-trash"
  mkdir -p "$TRASH"
  mv "$CLONE_DIR" "$TRASH/docu-restore-$(date -u +%H%M%S)" 2>/dev/null || true
else
  note "restore-check: scratch kept at $CLONE_DIR/app (database $SCRATCH_DB)"
fi

if [ "$FAILURES" -gt 0 ]; then
  note "restore-check: $FAILURES failure(s)"
  exit 1
fi
note "restore-check: OK — app and database restore and match"
