#!/bin/sh
# Verifica la metadata viva del harness: cada pieza (comando, subagente, skill
# propia o vendorizada) declara dueno, disparador y proposito; las vendorizadas
# ademas origen y version. Falla si falta un campo o si el dueno no existe en
# docs/proyecto/EQUIPO.md. Registro en docs/HARNESS.md y docs/integraciones/CAPACIDADES.md.
set -u
cd "$(dirname "$0")/.."

EQUIPO=docs/proyecto/EQUIPO.md
hallazgos=0
total=0

fm() {
  awk 'NR==1 && $0 !~ /^---[[:space:]]*$/ {exit} /^---[[:space:]]*$/ {c++; if (c==2) exit; next} c==1 {print}' "$1"
}

reportar() { echo "HALLAZGO: $1: $2"; hallazgos=$((hallazgos+1)); }

check_pieza() {
  pieza=$1
  es_vendor=$2
  total=$((total+1))
  bloque=$(fm "$pieza")
  if [ -z "$bloque" ]; then
    reportar "$pieza" "sin frontmatter"
    return
  fi
  for campo in dueno disparador proposito; do
    printf '%s\n' "$bloque" | grep -q "^$campo:" || reportar "$pieza" "falta $campo"
  done
  if [ "$es_vendor" = 1 ]; then
    printf '%s\n' "$bloque" | grep -q "^metadata:" || reportar "$pieza" "falta metadata (vendor)"
    for campo in repo commit version; do
      printf '%s\n' "$bloque" | grep -q "^  $campo:" || reportar "$pieza" "falta metadata.$campo (vendor)"
    done
  fi
  dueno=$(printf '%s\n' "$bloque" | sed -n 's/^dueno:[[:space:]]*//p')
  if [ -n "$dueno" ] && ! grep -qF "$dueno" "$EQUIPO"; then
    reportar "$pieza" "dueno '$dueno' no existe en EQUIPO.md"
  fi
}

es_vendor() {
  case "$1" in
    .opencode/skills/vendor/*) return 0 ;;
    *) return 1 ;;
  esac
}

descubrir() {
  find .opencode/commands -type f -name '*.md' 2>/dev/null
  find .opencode/agents -type f -name '*.md' 2>/dev/null
  find .opencode/skills -mindepth 2 -maxdepth 2 -type f -name 'SKILL.md' 2>/dev/null
  find .opencode/skills/vendor -mindepth 2 -maxdepth 2 -type f -name 'SKILL.md' 2>/dev/null
}

descubiertas=$(descubrir | sort -u)
for pieza in $descubiertas; do
  if es_vendor "$pieza"; then check_pieza "$pieza" 1; else check_pieza "$pieza" 0; fi
done

INDICE=docs/integraciones/CAPACIDADES.md
if [ -f "$INDICE" ]; then
  en_indice=$(grep -o '^| `\.opencode/[^`]*`' "$INDICE" | sed 's/^| `//; s/`$//' | sort -u)
  for pieza in $descubiertas; do
    printf '%s\n' "$en_indice" | grep -qxF "$pieza" || reportar "$pieza" "no aparece en CAPACIDADES.md (huerfana)"
  done
  for pieza in $en_indice; do
    [ -e "$pieza" ] || reportar "$pieza" "listada en CAPACIDADES.md pero no existe en disco (fantasma)"
  done
else
  reportar "$INDICE" "no existe (indice vivo del harness)"
fi

if [ "$hallazgos" -gt 0 ]; then
  echo "harness-check: $hallazgos hallazgo(s) sobre $total piezas"
  exit 1
fi
echo "harness: $total piezas, 0 hallazgos"
