#!/bin/sh
# DOCU doctor: reports what is missing to work, without failing. Exit 0 always unless
# invocation error. Readable output: OK / MISSING / WARN.
set -u
cd "$(dirname "$0")/.."

ok=0; missing=0; warn=0
green=''; red=''; yellow=''; end=''
if [ -t 1 ]; then green=$(printf '\033[32m'); red=$(printf '\033[31m'); yellow=$(printf '\033[33m'); end=$(printf '\033[0m'); fi

line() { printf '%s\n' "$1"; }
ok_line()     { ok=$((ok+1));     line "${green}OK${end}     $1"; }
missing_line(){ missing=$((missing+1)); line "${red}MISSING${end}  $1"; }
warn_line()   { warn=$((warn+1)); line "${yellow}WARN${end}  $1"; }

line "== runtime =="
want_bun=$(bun -e 'console.log((require("./package.json").packageManager||"").replace("bun@",""))' 2>/dev/null)
have_bun=$(bun --version 2>/dev/null)
want_mm=$(printf '%s' "$want_bun" | cut -d. -f1,2)
have_mm=$(printf '%s' "$have_bun" | cut -d. -f1,2)
if [ "$want_bun" = "$have_bun" ]; then
  ok_line "Bun $have_bun (pinned in package.json)"
elif [ "$want_mm" = "$have_mm" ]; then
  warn_line "Bun $have_bun != $want_bun pinned in packageManager (same major.minor; the patch usually breaks nothing)"
else
  missing_line "Bun $have_bun != $want_bun pinned in packageManager"
fi

line ""
line "== pinned tools =="
schema_biome=$(sed -n 's#.*schemas/\([0-9.]*\)/schema.json.*#\1#p' biome.json)
if [ -x node_modules/.bin/biome ]; then
  have_biome=$(bun node_modules/.bin/biome --version 2>/dev/null | sed 's/^Version: //')
  if [ "$have_biome" = "$schema_biome" ]; then ok_line "Biome $have_biome local = schema $schema_biome"; else missing_line "Local Biome $have_biome != schema $schema_biome"; fi
else
  missing_line "Biome not installed. Run 'bun install' (it is declared in devDependencies)"
fi

# Only an executable command with @latest counts as a failure, not the prose that
# explains why it is forbidden.
if grep -rEn '`[^`]*(bunx|npm|pnpm|bun) +[a-z@][^`]*@latest' docs/ README.md AGENTS.md 2>/dev/null | grep -v 'que esta prohibido\|era `8\.0\|instalaria una release'; then
  missing_line "Command with @latest in the documentation. Pin the version: ADR-0007 point 5"
else
  ok_line "No documented command uses @latest"
fi

line ""
line "== environment =="
if [ -f .env ]; then ok_line ".env exists (never committed)"; else missing_line ".env does not exist. It is created by 'bun run dev' or: cp .env.example .env"; fi
for k in DATABASE_URL REDIS_URL JWT_SECRET GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET GOOGLE_REFRESH_TOKEN GOOGLE_DRIVE_FOLDER ENGRAM_PROJECT; do
  if [ -f .env ] && grep -q "^${k}=" .env; then :; else warn_line "variable missing in .env: $k"; fi
done

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then ok_line "gh logged in ($(gh api user --jq .login 2>/dev/null))"; else missing_line "gh not installed or not logged in. Run: bun run setup"; fi
if command -v opencode >/dev/null 2>&1; then ok_line "opencode installed"; else warn_line "opencode not installed. Run: bun run setup"; fi
if command -v engram >/dev/null 2>&1; then ok_line "engram $(engram --version 2>/dev/null | head -1)"; else warn_line "engram not installed. Project memory without CLI: see docs/operacion/BOOTSTRAP.md"; fi
if bash scripts/drive-check.sh >/dev/null 2>&1; then
  ok_line "drive: folder + 3 stages resolve live"
else
  code=$?
  if [ "$code" -eq 2 ]; then
    warn_line "drive skipped (no OAuth or no network). The team lead provides it: docs/integraciones/DRIVE.md"
  else
    missing_line "drive has credentials but cannot read. Check OAuth: docs/integraciones/DRIVE.md"
  fi
fi
for f in .opencode/commands/inicio.md .opencode/skills/docu-gestion/SKILL.md; do [ -f "$f" ] && ok_line "agent: $f" || missing_line "agent: missing $f"; done
if [ -f .opencode/opencode.jsonc ] || [ -f .opencode/opencode.json ]; then warn_line ".opencode/opencode.json(c) local is legacy: opencode does not read it, the contract is opencode.json at the root"; else ok_line "no local opencode config (opencode.json is the authority)"; fi

if command -v docker >/dev/null 2>&1; then ok_line "docker $(docker --version | sed 's/.*version //;s/,.*//')"; else missing_line "docker not installed"; fi

line ""
line "== executable gates =="
if bun run lint >/dev/null 2>&1; then ok_line "bun run lint (biome, linter recommended)"; else missing_line "bun run lint fails"; fi
if bun run typecheck >/dev/null 2>&1; then ok_line "bun run typecheck"; else missing_line "bun run typecheck fails"; fi
if bun run compose:check >/dev/null 2>&1; then ok_line "compose config"; else missing_line "docker compose config fails"; fi
if bun run smoke:api >/dev/null 2>&1; then
  ok_line "smoke:api (/health responds ok)"
else
  code=$?
  if [ "$code" -eq 2 ]; then
    warn_line "smoke:api skipped, missing infrastructure. 'docker compose -f infra/docker-compose.yml --env-file .env up -d --wait'"
  else
    missing_line "smoke:api fails: the API does not start or /health does not respond. See bash scripts/smoke-api.sh"
  fi
fi
n_web=$(find apps/web/src -name '*.spec.ts' 2>/dev/null | wc -l | tr -d ' ')
n_api=$(find apps/api/src -name '*.spec.ts' 2>/dev/null | wc -l | tr -d ' ')
if [ "$n_web" -gt 0 ]; then ok_line "web tests: $n_web file(s)"; else warn_line "apps/web without tests"; fi
if [ "$n_api" -gt 0 ]; then ok_line "api tests: $n_api file(s)"; else warn_line "apps/api without tests. RNF-07 does not hold without them (RNF-07, Sprint 4)"; fi

line ""
line "== docs index =="
if bash scripts/doc-index.sh >/dev/null 2>&1; then ok_line "docs index is honest (docs/.indice)"; else missing_line "docs/.indice does not match disk. Fix it: bash scripts/doc-index.sh --fix"; fi

line ""
line "== harness =="
if bash scripts/harness-check.sh >/dev/null 2>&1; then ok_line "harness: metadata and catalog green"; else missing_line "harness-check fails: review owner/trigger/purpose or CAPACIDADES.md"; fi

line ""
line "== git hygiene =="
root=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
dirty=$(cd "$root" && git status --porcelain | grep -v '^?? node_modules' | wc -l | tr -d ' ')
[ "$dirty" -eq 0 ] && ok_line "clean tree" || warn_line "$dirty path(s) uncommitted on branch $(cd "$root" && git rev-parse --abbrev-ref HEAD)"
for p in .claude .cursor .codex; do
  if [ -e "$root/$p" ]; then
    if git -C "$root" check-ignore -q "$p" 2>/dev/null; then warn_line "$p/ exists locally and is in .gitignore (correct)"; else missing_line "$p/ exists and is NOT in .gitignore"; fi
  fi
done

line ""
line "-------------------------------------------"
line "OK=$ok  MISSING=$missing  WARN=$warn"
if [ "$missing" -gt 0 ]; then line "Fix MISSING before working. WARN does not block."; else line "Environment operable."; fi
exit 0
