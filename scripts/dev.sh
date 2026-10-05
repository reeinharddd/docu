#!/bin/sh
# DOCU bootstrap unico: deja infra + BD + API corriendo. Idempotente.
set -eu
cd "$(dirname "$0")/.."
test -f .env || cp .env.example .env
docker compose -f infra/docker-compose.yml --env-file .env up -d --wait
(cd apps/api && bunx prisma generate && bunx prisma migrate deploy)
(cd apps/api && bun --env-file ../../.env prisma/seed.ts)
(cd apps/api && exec bun --env-file ../../.env src/main.ts)
