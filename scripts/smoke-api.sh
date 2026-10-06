#!/bin/sh
# Arranca la API y consulta /health esperando por condicion, no por tiempo fijo.
# Motivo: un `sleep 12` esconde el fallo. Esto falla si la API no levanta.
#
# Salida: 0 = ok, 1 = la API no responde, 2 = falta infraestructura (no es fallo).
set -u
cd "$(dirname "$0")/../apps/api"
log=/tmp/docu-smoke-api.log
puerto=${PORT_API:-3000}

# La API lee el .env de la raiz del monorepo. Sin esto, DATABASE_URL llega vacio
# y falla el SCRAM de Postgres. Mismo criterio que scripts/dev.sh.
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
