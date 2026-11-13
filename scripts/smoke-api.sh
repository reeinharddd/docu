#!/bin/sh
# Starts the worker and the API and queries /health waiting for a condition, not for a fixed time.
# Why: `sleep 12` hides the failure. This fails if the API does not come up.
#
# The worker is a separate process (BRIEF #46): the health gate reports
# whether it is alive and how deep the queues are, so the smoke starts it too.
#
# Output: 0 = ok, 1 = API does not respond, 2 = missing infrastructure (not a failure).
set -u
cd "$(dirname "$0")/../apps/api"
log=/tmp/docu-smoke-api.log
worker_log=/tmp/docu-smoke-worker.log

# The API reads PORT_API from the root .env; this script must poll the same
# port or the gate checks a different process than the one it started
# (orchestration drill 2026-11-07). An explicit PORT_API in the environment
# still wins over the .env value.
puerto=${PORT_API:-}
if [ -z "$puerto" ] && [ -f ../../.env ]; then
  puerto=$(grep -E '^PORT_API=' ../../.env | tail -1 | cut -d= -f2)
fi
puerto=${puerto:-3000}

# The API reads the .env at the monorepo root. Without this, DATABASE_URL arrives empty
# and Postgres SCRAM fails. Same criteria as scripts/dev.sh.
# The PIDs are taken here, inside the branch: reading $! after the if/else would
# give the same pid twice and leave the worker alive (BRIEF #46).
if [ -f ../../.env ]; then
  bun --env-file ../../.env src/worker/worker.ts >"$worker_log" 2>&1 &
  worker_pid=$!
  bun --env-file ../../.env src/main.ts >"$log" 2>&1 &
  api_pid=$!
else
  bun src/worker/worker.ts >"$worker_log" 2>&1 &
  worker_pid=$!
  bun src/main.ts >"$log" 2>&1 &
  api_pid=$!
fi
cleanup() {
  kill "$api_pid" "$worker_pid" 2>/dev/null
  wait "$api_pid" 2>/dev/null
  # Si un proceso no obedece el TERM, no se queda robando jobs de la cola.
  sleep 0.2
  kill -9 "$api_pid" "$worker_pid" 2>/dev/null
}
trap cleanup EXIT INT TERM

diagnose() {
  if grep -qi "SCRAM\|password must be\|Can't reach database server\|ECONNREFUSED.*5432" "$log"; then
    echo "Cause: the API cannot reach PostgreSQL. Start infra:"
    echo "  docker compose -f infra/docker-compose.yml --env-file .env up -d --wait"
  elif grep -qi 'ECONNREFUSED.*6379' "$log"; then
    echo "Cause: the API cannot reach Redis. Start infra with the same compose."
  fi
  tail -25 "$log"
  if [ -s "$worker_log" ]; then
    echo "--- worker:"
    tail -15 "$worker_log"
  fi
}

attempts=60
i=0
while [ "$i" -lt "$attempts" ]; do
  if ! kill -0 "$api_pid" 2>/dev/null; then
    echo "FAIL: the API exited before responding"
    diagnose
    exit 1
  fi
  if ! kill -0 "$worker_pid" 2>/dev/null; then
    echo "FAIL: the worker exited before responding"
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
