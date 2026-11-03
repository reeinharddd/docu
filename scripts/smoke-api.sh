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

diagnostico() {
  if grep -qi "SCRAM\|password must be\|Can't reach database server\|ECONNREFUSED.*5432" "$log"; then
    echo "Causa: la API no alcanza PostgreSQL. Levanta infra:"
    echo "  docker compose -f infra/docker-compose.yml --env-file .env up -d --wait"
  elif grep -qi 'ECONNREFUSED.*6379' "$log"; then
    echo "Causa: la API no alcanza Redis. Levanta infra con el mismo compose."
  fi
  tail -25 "$log"
}

intentos=60
i=0
while [ "$i" -lt "$intentos" ]; do
  if ! kill -0 "$api_pid" 2>/dev/null; then
    echo "FALLA: la API termino antes de responder"
    diagnostico
    exit 1
  fi
  if curl -sf "http://localhost:$puerto/health" 2>/dev/null | grep -q '"status":"ok"'; then
    echo "OK: /health responde ok"
    exit 0
  fi
  i=$((i+1)); sleep 0.5
done

echo "FALLA: /health no respondio ok en 30s"
diagnostico
exit 1
