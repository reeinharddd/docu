#!/bin/sh
# Starts the API and queries /health waiting for a condition, not for a fixed time.
# Why: `sleep 12` hides the failure. This fails if the API does not come up.
#
# Output: 0 = ok, 1 = API does not respond, 2 = missing infrastructure (not a failure).
set -u
cd "$(dirname "$0")/../apps/api"
log=/tmp/docu-smoke-api.log
puerto=${PORT_API:-3000}

# The API reads the .env at the monorepo root. Without this, DATABASE_URL arrives empty
# and Postgres SCRAM fails. Same criteria as scripts/dev.sh.
if [ -f ../../.env ]; then
  bun --env-file ../../.env src/main.ts >"$log" 2>&1 &
else
  bun src/main.ts >"$log" 2>&1 &
fi
api_pid=$!
cleanup() { kill "$api_pid" 2>/dev/null; wait "$api_pid" 2>/dev/null; }
trap cleanup EXIT INT TERM

diagnose() {
  if grep -qi "SCRAM\|password must be\|Can't reach database server\|ECONNREFUSED.*5432" "$log"; then
    echo "Cause: the API cannot reach PostgreSQL. Start infra:"
    echo "  docker compose -f infra/docker-compose.yml --env-file .env up -d --wait"
  elif grep -qi 'ECONNREFUSED.*6379' "$log"; then
    echo "Cause: the API cannot reach Redis. Start infra with the same compose."
  fi
  tail -25 "$log"
}

attempts=60
i=0
while [ "$i" -lt "$attempts" ]; do
  if ! kill -0 "$api_pid" 2>/dev/null; then
    echo "FAIL: the API exited before responding"
    diagnose
    exit 1
  fi
  if curl -sf "http://localhost:$puerto/health" 2>/dev/null | grep -q '"status":"ok"'; then
    echo "OK: /health responds ok"
    exit 0
  fi
  i=$((i+1)); sleep 0.5
done

echo "FAIL: /health did not respond ok in 30s"
diagnose
exit 1
