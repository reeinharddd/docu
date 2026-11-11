#!/bin/bash
# DOCU — local AI engines setup (REPLAN-2026-10-30, lane C).
#
# Brings up the Ollama container from infra/docker-compose.yml, pulls the
# models named in .env (IA_OCR_MODEL, IA_LLM_MODEL, IA_EMBEDDING_MODEL) and
# verifies the OpenAI-compatible surface plus the scoring endpoint
# (IA_SCORING_URL). Idempotent: re-running only re-checks and re-pulls.
# Never uses sudo; models live in the docu_ollama docker volume.
set -eu
cd "$(dirname "$0")/.."

c_ok=$'\033[32m'
c_warn=$'\033[33m'
c_end=$'\033[0m'
warnings=0
step() { printf '\n== %s ==\n' "$1"; }
ok()   { printf '%sOK%s     %s\n' "$c_ok" "$c_end" "$1" >&2; warnings=$((warnings)); }
warn() { printf '%sWARN%s  %s\n' "$c_warn" "$c_end" "$1" >&2; warnings=$((warnings+1)); }

compose() { docker compose -f infra/docker-compose.yml --env-file .env "$@"; }

env_var() { grep -E "^$1=" .env 2>/dev/null | tail -1 | cut -d= -f2-; }

if ! command -v docker >/dev/null 2>&1; then
  echo "docker no está disponible: es requisito del carril de IA (scripts/setup.sh lo comprueba)" >&2
  exit 1
fi
test -f .env || cp .env.example .env

step "ollama container"
compose up -d --wait ollama
ok "ollama arriba en el puerto $(env_var IA_OLLAMA_PORT || echo 11434)"

step "models (IA_OCR_MODEL, IA_LLM_MODEL, IA_EMBEDDING_MODEL)"
# Pulls the configured model; prints the model name that ended up working
# (stdout). Human messages go to stderr. Falls back to the colon-tag form
# ('model-0.6b' -> 'model:0.6b') that the Ollama registry actually serves.
pull_model() {
  model="$1"
  alias="$2"
  hint="$3"
  if compose exec -T ollama ollama pull "$model" >/dev/null 2>&1; then
    ok "$alias = $model"
    printf '%s' "$model"
    return 0
  fi
  fallback=$(printf '%s' "$model" | sed -E 's/-([0-9][0-9.]*b)$/:\1/')
  if [ -n "$fallback" ] && [ "$fallback" != "$model" ] \
    && compose exec -T ollama ollama pull "$fallback" >/dev/null 2>&1; then
    warn "$alias: '$model' no está en el registro; se usó '$fallback'. Actualiza $alias en .env"
    printf '%s' "$fallback"
    return 0
  fi
  warn "$alias: '$model' no está en el registro de Ollama. $hint"
  return 1
}

ocr_model=$(pull_model "$(env_var IA_OCR_MODEL || echo glm-ocr)" "IA_OCR_MODEL" \
  "El checkpoint del caso vive como paquete comunitario 'frozenlab/glm-ocr:0.9b' (o apunta IA_API_BASE_URL a un motor de visión propio)" || true)
llm_model=$(pull_model "$(env_var IA_LLM_MODEL || echo llama3.2)" "IA_LLM_MODEL" \
  "Modelo de clasificación y consulta (IA.md §5): usa 'llama3.2' o el que la instalación opere" || true)
embed_model=$(pull_model "$(env_var IA_EMBEDDING_MODEL || echo qwen3-embedding-0.6b)" "IA_EMBEDDING_MODEL" \
  "El contrato pide 768 dimensiones (IA.md §6): 'qwen3-embedding:0.6b' u otro compatible MRL a 768" || true)

step "OpenAI-compatible surface (IA_API_BASE_URL)"
base_url=$(env_var IA_API_BASE_URL || echo 'http://localhost:11434/v1')
if [ -n "$llm_model" ]; then
  chat_code=$(curl -s -o /tmp/opencode-ia-chat.json -w '%{http_code}' \
    --max-time 60 "$base_url/chat/completions" \
    -H 'Content-Type: application/json' \
    -d "{\"model\":\"$llm_model\",\"messages\":[{\"role\":\"user\",\"content\":\"Responde solo: ok\"}],\"max_tokens\":8,\"temperature\":0}" || true)
  chat_code=${chat_code:-000}
  if [ "$chat_code" = "200" ]; then
    ok "POST /v1/chat/completions responde 200 con $llm_model"
  else
    warn "POST /v1/chat/completions respondió $chat_code: revisa que el modelo $llm_model esté cargado"
  fi
fi

if [ -n "$embed_model" ]; then
  # The ER v1 freezes vector(768) (IA.md §6). Qwen3-Embedding is MRL-capable:
  # the dimension must be REQUESTED, the provider default differs (1024).
  embed_code=$(curl -s -o /tmp/opencode-ia-embed.json -w '%{http_code}' \
    --max-time 60 "$base_url/embeddings" \
    -H 'Content-Type: application/json' \
    -d "{\"model\":\"$embed_model\",\"input\":\"prueba de semilla\",\"dimensions\":768}" || true)
  if [ "$embed_code" = "200" ]; then
    dims=$(python3 -c "import json;print(len(json.load(open('/tmp/opencode-ia-embed.json'))['data'][0]['embedding']))" 2>/dev/null || echo '?')
    if [ "$dims" = "768" ]; then
      ok "POST /v1/embeddings responde 200 con 768 dimensiones pedidas (contrato del ER)"
    else
      warn "POST /v1/embeddings devolvió $dims dimensiones: el contrato del ER exige 768 (IA.md §6)"
    fi
  else
    warn "POST /v1/embeddings respondió $embed_code: revisa el modelo de embeddings"
  fi
fi

step "scoring engine (IA_SCORING_URL)"
scoring_url=$(env_var IA_SCORING_URL || echo 'http://localhost:8000/v1/systemone')
scoring_code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$scoring_url" \
  -H 'Content-Type: application/json' -d '{"input":"prueba","labels":[]}' || true)
scoring_code=${scoring_code:-000}
if [ "$scoring_code" = "000" ]; then
  warn "IA_SCORING_URL ($scoring_url) no responde: el motor de scoring (Laya/SystemOne) no está levantado; es opcional hasta el carril de clasificación (#3)"
else
  ok "IA_SCORING_URL ($scoring_url) responde HTTP $scoring_code"
fi

rm -f /tmp/opencode-ia-chat.json /tmp/opencode-ia-embed.json

printf '\n'
if [ "$warnings" -gt 0 ]; then
  warn "setup de IA terminó con $warnings aviso(s): los motores faltantes se ajustan en .env, nunca en código (ADR-0020)"
else
  ok "setup de IA terminó sin avisos"
fi
