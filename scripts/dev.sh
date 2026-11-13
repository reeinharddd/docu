#!/bin/sh
# DOCU single bootstrap: leaves infra + DB + worker + API running. Idempotent.
set -eu
cd "$(dirname "$0")/.."
test -f .env || cp .env.example .env
docker compose -f infra/docker-compose.yml --env-file .env up -d --wait

# The worker is a separate process: the API enqueues and the worker processes
# (ADR-0011), and the health gate says whether it is alive (BRIEF #46).
cd apps/api
bun --env-file ../../.env src/worker/worker.ts >/tmp/docu-worker.log 2>&1 &
worker_pid=$!
cleanup() {
  kill "$worker_pid" 2>/dev/null || true
  sleep 0.2
  kill -9 "$worker_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM
bun --env-file ../../.env src/main.ts
