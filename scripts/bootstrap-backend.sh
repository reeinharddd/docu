#!/usr/bin/env bash
# DOCU — arranque completo del backend con un solo comando.
#
#   bash scripts/bootstrap-backend.sh
#
# Deja listo TODO lo que el backend necesita para develop:
#   1. .env (a partir de .env.example) y dependencias de bun
#   2. infraestructura: Postgres + Redis + Ollama (docker compose)
#   3. cliente Prisma generado y migración base aplicada
#   4. semilla de las tres capas (motor + caso C1 + corpus dinámico de #59)
#   5. motores de IA: modelos descargados y contratos verificados
#
# Idempotente: se puede correr las veces que sea. No usa sudo. No borra
# datos: la semilla usa UUID fijos y ON CONFLICT DO NOTHING.
#
# Lo que NO hace (y por qué): no arranca la API (eso es `bun run dev`, que
# se queda en primer plano) ni descarga el corpus del mes (#59/#61).
set -euo pipefail
cd "$(dirname "$0")/.."

c_ok=$'\033[32m'
c_warn=$'\033[33m'
c_err=$'\033[31m'
c_end=$'\033[0m'
warnings=0
step() { printf '\n== %s ==\n' "$1"; }
ok() { printf '%sOK%s     %s\n' "$c_ok" "$c_end" "$1"; }
warn() {
  printf '%sWARN%s  %s\n' "$c_warn" "$c_end" "$1"
  warnings=$((warnings + 1))
}
fail() {
  printf '%sERROR%s  %s\n' "$c_err" "$c_end" "$1"
  exit 1
}

compose() { docker compose -f infra/docker-compose.yml --env-file .env "$@"; }
env_var() { grep -E "^$1=" .env 2>/dev/null | tail -1 | cut -d= -f2-; }

step "requisitos"
command -v bun >/dev/null || fail "bun no está instalado (ver docs/operacion/BOOTSTRAP.md)"
ok "bun $(bun --version)"
command -v docker >/dev/null || fail "docker no está instalado: la base, Redis y Ollama corren en contenedores"
docker info >/dev/null 2>&1 || fail "docker no responde: arranca el daemon (Docker Desktop o dockerd)"
ok "$(docker --version | sed 's/,.*//')"

step "configuración"
test -f .env || {
  cp .env.example .env
  ok ".env creado a partir de .env.example (las credenciales de Drive las pide el responsable del proyecto)"
}
grep -q '^GOOGLE_REFRESH_TOKEN=.\+' .env || warn "GOOGLE_REFRESH_TOKEN vacío: la ingesta desde Drive no podrá leer (solo Drive/Docs, siempre de lectura)"
ok ".env listo (DATABASE_URL=$(env_var DATABASE_URL))"

step "dependencias"
bun install --frozen-lockfile >/dev/null || fail "bun install falló"
ok "dependencias instaladas"

step "infraestructura (postgres, redis, ollama)"
compose up -d --wait
ok "postgres, redis y ollama arriba (puertos $(env_var PG_PORT || echo 5432), $(env_var REDIS_PORT || echo 6379), 11434)"

step "base de datos"
bun run db:generate >/dev/null || fail "prisma generate falló"
ok "cliente prisma generado"
bun run db:deploy >/dev/null || fail "prisma migrate deploy falló: revisa apps/api/prisma/migrations"
ok "migraciones aplicadas"

step "semilla (motor + C1)"
bun run db:seed || fail "la semilla falló"
ok "semilla aplicada"

step "motores de IA"
bash scripts/setup-ia.sh || warn "el setup de IA quedó incompleto: revisa scripts/setup-ia.sh"

step "artefacto OpenAPI"
bun run api:openapi >/dev/null || warn "no se pudo regenerar docs/api/openapi.json"
ok "docs/api/openapi.json al día"

printf '\n-------------------------------------------\n'
if [ "$warnings" -eq 0 ]; then
  printf 'Backend listo (%s warning(s)).\n' "$warnings"
else
  printf 'Backend listo con %s warning(s).\n' "$warnings"
fi
cat <<'NEXT'
Siguientes pasos:
  1. Levanta la API:            bun run dev
  2. Comprueba que responde:    curl -s localhost:3000/health
  3. Inicia sesión:             curl -s -X POST localhost:3000/v1/auth/login \
                                  -H 'Content-Type: application/json' \
                                  -d '{"username":"andres","password":"<la que imprime la semilla>"}'
  4. Documentación viva:        http://localhost:3000/v1/docs
  5. Cambia la contraseña:      bun run db:password andres
NEXT
