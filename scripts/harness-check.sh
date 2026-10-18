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
    for campo in origen version; do
      printf '%s\n' "$bloque" | grep -q "^$campo:" || reportar "$pieza" "falta $campo (vendor)"
    done
  fi
  dueno=$(printf '%s\n' "$bloque" | sed -n 's/^dueno:[[:space:]]*//p')
  if [ -n "$dueno" ] && ! grep -qF "$dueno" "$EQUIPO"; then
    reportar "$pieza" "dueno '$dueno' no existe en EQUIPO.md"
  fi
}

for pieza in $(find .opencode/commands -type f -name '*.md' | sort); do check_pieza "$pieza" 0; done
for pieza in $(find .opencode/agents -type f -name '*.md' | sort); do check_pieza "$pieza" 0; done
for pieza in $(find .opencode/skills -mindepth 2 -maxdepth 2 -type f -name 'SKILL.md' | sort); do check_pieza "$pieza" 0; done
for pieza in $(find .opencode/skills/vendor -mindepth 2 -maxdepth 2 -type f -name 'SKILL.md' | sort); do check_pieza "$pieza" 1; done

if [ "$hallazgos" -gt 0 ]; then
  echo "harness-check: $hallazgos hallazgo(s) sobre $total piezas"
  exit 1
fi
echo "harness: $total piezas, 0 hallazgos"
