#!/bin/sh
# DOCU doctor: dice que falta para trabajar, sin fallar. Exit 0 siempre salvo
# error de invocacion. Salida legible: OK / FALTA / AVISO.
set -u
cd "$(dirname "$0")/.."

ok=0; falta=0; aviso=0
verde=''; rojo=''; amarillo=''; fin=''
if [ -t 1 ]; then verde=$(printf '\033[32m'); rojo=$(printf '\033[31m'); amarillo=$(printf '\033[33m'); fin=$(printf '\033[0m'); fi

line() { printf '%s\n' "$1"; }
ok_line()   { ok=$((ok+1));     line "${verde}OK${fin}     $1"; }
falta_line(){ falta=$((falta+1)); line "${rojo}FALTA${fin}  $1"; }
aviso_line(){ aviso=$((aviso+1)); line "${amarillo}AVISO${fin}  $1"; }

line "== runtime =="
want_bun=$(bun -e 'console.log((require("./package.json").packageManager||"").replace("bun@",""))' 2>/dev/null)
have_bun=$(bun --version 2>/dev/null)
if [ "$want_bun" = "$have_bun" ]; then ok_line "Bun $have_bun (fijado en package.json)"; else falta_line "Bun $have_bun != $want_bun fijado en packageManager"; fi

line ""
line "== herramientas fijadas =="
schema_biome=$(sed -n 's#.*schemas/\([0-9.]*\)/schema.json.*#\1#p' biome.json)
if [ -x node_modules/.bin/biome ]; then
  have_biome=$(node_modules/.bin/biome --version 2>/dev/null | sed 's/^Version: //')
  if [ "$have_biome" = "$schema_biome" ]; then ok_line "Biome $have_biome local = schema $schema_biome"; else falta_line "Biome local $have_biome != schema $schema_biome"; fi
else
  falta_line "Biome no instalado. Corre 'bun install' (esta declarado en devDependencies)"
fi

pinned_prisma=$(sed -n 's/.*"prisma": *"\([0-9.]*\)".*/\1/p' apps/api/package.json)
if [ -x apps/api/node_modules/.bin/prisma ]; then
  ok_line "Prisma $pinned_prisma instalado (ultimo estable; la 8 sigue en RC)"
else
  falta_line "Prisma no generado. Corre 'bunx prisma generate' en apps/api"
fi
# Solo cuenta como fallo un comando ejecutable con @latest, no la prosa que
# explica por que esta prohibido.
if grep -rEn '`[^`]*(bunx|npm|pnpm|bun) +[a-z@][^`]*@latest' docs/ README.md AGENTS.md 2>/dev/null | grep -v 'que esta prohibido\|era `8\.0\|instalaria una release'; then
  falta_line "Comando con @latest en la documentacion. Fijar version: ADR-0007 punto 5"
else
  ok_line "Ningun comando documentado usa @latest"
fi

line ""
line "== entorno =="
if [ -f .env ]; then ok_line ".env existe (no se commitea)"; else falta_line ".env no existe. Se crea solo con 'bun run dev' o: cp .env.example .env"; fi
for k in DATABASE_URL REDIS_URL JWT_SECRET GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET GOOGLE_REFRESH_TOKEN GOOGLE_DRIVE_FOLDER ENGRAM_PROYECTO; do
  if [ -f .env ] && grep -q "^${k}=" .env; then :; else aviso_line "variable ausente en .env: $k"; fi
done

if command -v docker >/dev/null 2>&1; then ok_line "docker $(docker --version | sed 's/.*version //;s/,.*//')"; else falta_line "docker no instalado"; fi

line ""
line "== gates ejecutables =="
if bun run lint >/dev/null 2>&1; then ok_line "bun run lint (biome, linter recommended)"; else falta_line "bun run lint falla"; fi
if bun run typecheck >/dev/null 2>&1; then ok_line "bun run typecheck"; else falta_line "bun run typecheck falla"; fi
if bun run compose:check >/dev/null 2>&1; then ok_line "compose config"; else falta_line "docker compose config falla"; fi
if bun run smoke:api >/dev/null 2>&1; then
  ok_line "smoke:api (/health responde ok)"
else
  code=$?
  if [ "$code" -eq 2 ]; then
    aviso_line "smoke:api omitido, falta infraestructura. 'docker compose -f infra/docker-compose.yml --env-file .env up -d --wait'"
  else
    falta_line "smoke:api falla: la API no levanta o /health no responde. Ver bash scripts/smoke-api.sh"
  fi
fi
n_web=$(find apps/web/src -name '*.spec.ts' 2>/dev/null | wc -l | tr -d ' ')
n_api=$(find apps/api/src -name '*.spec.ts' 2>/dev/null | wc -l | tr -d ' ')
if [ "$n_web" -gt 0 ]; then ok_line "pruebas web: $n_web archivo(s)"; else aviso_line "apps/web sin pruebas"; fi
if [ "$n_api" -gt 0 ]; then ok_line "pruebas api: $n_api archivo(s)"; else aviso_line "apps/api sin pruebas. RNF-07 no se sostiene sin ellas (RNF-07, Sprint 4)"; fi

line ""
line "== indice documental =="
if bash scripts/doc-index.sh >/dev/null 2>&1; then ok_line "indice de docs honesto (docs/.indice)"; else falta_line "docs/.indice no coincide con el disco. Corre: bash scripts/doc-index.sh --fix"; fi

line ""
line "== higiene git =="
raiz=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
sucios=$(cd "$raiz" && git status --porcelain | grep -v '^?? node_modules' | wc -l | tr -d ' ')
[ "$sucios" -eq 0 ] && ok_line "arbol limpio" || aviso_line "$sucios ruta(s) sin commitear en la rama $(cd "$raiz" && git rev-parse --abbrev-ref HEAD)"
for p in .claude .opencode .cursor .codex; do
  if [ -e "$raiz/$p" ]; then
    if git -C "$raiz" check-ignore -q "$p" 2>/dev/null; then aviso_line "$p/ existe localmente y esta en .gitignore (correcto)"; else falta_line "$p/ existe y NO esta en .gitignore"; fi
  fi
done

line ""
line "-------------------------------------------"
line "OK=$ok  FALTA=$falta  AVISO=$aviso"
if [ "$falta" -gt 0 ]; then line "Corrige FALTA antes de trabajar. AVISO no bloquea."; else line "Entorno operable."; fi
exit 0
