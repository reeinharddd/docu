#!/usr/bin/env bash
# DOCU setup: deja una maquina lista para trabajar en el repo con un solo
# comando. Idempotente: se puede correr las veces que haga falta.
# Linux, macOS y Windows con WSL2. Nada requiere sudo salvo que se indique.
set -euo pipefail
cd "$(dirname "$0")/.."

BIN="$HOME/.local/bin"
mkdir -p "$BIN"
export PATH="$HOME/.bun/bin:$HOME/.opencode/bin:$BIN:$PATH"

c_ok=''; c_warn=''; c_err=''; c_end=''
if [ -t 1 ]; then c_ok=$'\033[32m'; c_warn=$'\033[33m'; c_err=$'\033[31m'; c_end=$'\033[0m'; fi
paso() { printf '\n== %s ==\n' "$1"; }
ok()   { printf '%sOK%s     %s\n' "$c_ok" "$c_end" "$1"; }
aviso(){ printf '%sAVISO%s  %s\n' "$c_warn" "$c_end" "$1"; avisos=$((avisos+1)); }
error(){ printf '%sERROR%s  %s\n' "$c_err" "$c_end" "$1"; exit 1; }
avisos=0

paso "sistema"
os=$(uname -s); arch=$(uname -m)
case "$os" in
  Linux)  grep -qi microsoft /proc/version 2>/dev/null && ok "Windows + WSL2 ($arch)" || ok "Linux ($arch)" ;;
  Darwin) ok "macOS ($arch)" ;;
  *) error "Sistema $os no soportado. En Windows usa WSL2: docs/operacion/BOOTSTRAP.md" ;;
esac
for t in git curl unzip; do command -v "$t" >/dev/null || error "falta '$t'. Instalalo con el gestor de paquetes del sistema y vuelve a correr"; done
ok "git, curl y unzip presentes"

paso "identidad de git"
if [ -z "$(git config user.name || true)" ] || [ -z "$(git config user.email || true)" ]; then
  if [ -t 0 ]; then
    read -rp "Tu nombre para los commits: " n; git config --global user.name "$n"
    read -rp "Tu correo de GitHub: " e; git config --global user.email "$e"
  else
    aviso "git sin user.name/user.email. Configuralo: git config --global user.name ... / user.email ..."
  fi
fi
ok "commits firmados como $(git config user.name) <$(git config user.email)>"

paso "bun"
want_bun=$(sed -n 's/.*"packageManager": *"bun@\([0-9.]*\)".*/\1/p' package.json)
if [ "$(bun --version 2>/dev/null || true)" != "$want_bun" ]; then
  echo "instalando bun $want_bun (en ~/.bun, sin sudo)"
  curl -fsSL https://bun.sh/install | bash -s "bun-v$want_bun" >/dev/null 2>&1
fi
[ "$(bun --version)" = "$want_bun" ] || error "bun $(bun --version) != $want_bun"
ok "bun $want_bun"

paso "github cli"
if ! command -v gh >/dev/null; then
  echo "instalando gh en $BIN (sin sudo)"
  tag=$(curl -fsSL https://api.github.com/repos/cli/cli/releases/latest | sed -n 's/.*"tag_name": *"v\([^"]*\)".*/\1/p' | head -1)
  case "$arch" in x86_64|amd64) a=amd64 ;; arm64|aarch64) a=arm64 ;; *) error "arquitectura $arch sin binario de gh" ;; esac
  tmp=$(mktemp -d)
  if [ "$os" = Darwin ]; then
    curl -fsSL -o "$tmp/gh.zip" "https://github.com/cli/cli/releases/download/v$tag/gh_${tag}_macOS_${a}.zip"
    unzip -q "$tmp/gh.zip" -d "$tmp"
  else
    curl -fsSL "https://github.com/cli/cli/releases/download/v$tag/gh_${tag}_linux_${a}.tar.gz" | tar -xz -C "$tmp"
  fi
  cp "$tmp"/gh_*/bin/gh "$BIN/gh"; rm -rf "$tmp"
fi
ok "$(gh --version | head -1)"
ghk() { env -u GITHUB_TOKEN -u GH_TOKEN gh "$@"; }
if ! ghk auth status -h github.com >/dev/null 2>&1; then
  [ -t 0 ] || error "gh sin sesion. Corre: gh auth login -h github.com -s project"
  echo "Inicia sesion con tu cuenta de GitHub (se abre el navegador):"
  ghk auth login -h github.com -p https -w -s project
fi
if ! ghk auth status -h github.com 2>&1 | grep -q "'project'"; then
  if [ -t 0 ]; then ghk auth refresh -h github.com -s project; else aviso "a la sesion de gh le falta el scope 'project': gh auth refresh -h github.com -s project"; fi
fi
ok "gh con sesion de $(gh api user --jq .login)"
if [ -n "${GITHUB_TOKEN:-}${GH_TOKEN:-}" ] && ! gh api -i user 2>/dev/null | grep -i '^x-oauth-scopes:' | grep -q project; then
  aviso "tu shell exporta GITHUB_TOKEN/GH_TOKEN sin scope 'project' y gh lo usa antes que tu sesion. Quita el export o regeneralo con: env -u GITHUB_TOKEN gh auth token"
fi
repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null || true)
[ -n "$repo" ] && ok "acceso al repositorio $repo" || aviso "sin acceso al repositorio en GitHub. Pide al lider que te agregue como colaborador"

paso "opencode"
if ! command -v opencode >/dev/null; then
  echo "instalando opencode (en ~/.opencode, sin sudo)"
  curl -fsSL https://opencode.ai/install | bash >/dev/null 2>&1
fi
command -v opencode >/dev/null || error "opencode no quedo en el PATH. Abre otra terminal y vuelve a correr"
ok "opencode $(opencode --version 2>/dev/null | head -1)"

paso "engram"
if command -v engram >/dev/null; then
  ok "engram $(engram --version 2>/dev/null | head -1)"
else
  aviso "engram no instalado. Es la memoria del proyecto (docs/integraciones/ENGRAM.md). Pide al lider el binario (va en ~/.local/bin); el MCP ya viene del repo"
fi

paso "docker"
if command -v docker >/dev/null && docker info >/dev/null 2>&1; then
  ok "$(docker --version | sed 's/,.*//')"
else
  aviso "docker no disponible. En E1 solo hace falta para 'bun run verify' (smoke de la API). Instala Docker Desktop o Docker Engine"
fi

paso "dependencias y hooks"
if [ ! -f .env ]; then cp .env.example .env; ok ".env creado desde .env.example (pide al lider las credenciales de Drive)"; else ok ".env ya existe"; fi
bun install --frozen-lockfile >/dev/null 2>&1 || error "bun install fallo. Corre: bun install --frozen-lockfile"
ok "bun install (lefthook instalado por postinstall)"

paso "rutas en el shell"
perfil="$HOME/.bashrc"; case "${SHELL:-}" in */zsh) perfil="$HOME/.zshrc" ;; esac
linea='export PATH="$HOME/.bun/bin:$HOME/.opencode/bin:$HOME/.local/bin:$PATH"'
grep -qF "$linea" "$perfil" 2>/dev/null || { printf '\n# DOCU setup\n%s\n' "$linea" >> "$perfil"; ok "PATH agregado a $perfil"; }
ok "bun, gh y opencode quedan en el PATH de nuevas terminales"

paso "diagnostico"
bash scripts/doctor.sh | grep -E "FALTA|^OK=" || true

printf '\n-------------------------------------------\n'
printf 'Listo (%s aviso/s). Siguiente:\n' "$avisos"
printf '  1. Abre una terminal nueva en esta carpeta y corre: opencode\n'
printf '  2. Dentro de opencode, la primera vez: /connect (elige proveedor de modelos)\n'
printf '  3. Luego: /inicio   (te dice quien eres en el equipo, tus tareas y reglas)\n'
