#!/bin/sh
# DOCU single bootstrap: leaves infra + DB + API running. Idempotent.
set -eu
cd "$(dirname "$0")/.."
test -f .env || cp .env.example .env
docker compose -f infra/docker-compose.yml --env-file .env up -d --wait
(cd apps/api && exec bun --env-file ../../.env src/main.ts)
