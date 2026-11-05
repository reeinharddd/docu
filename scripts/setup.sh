#!/usr/bin/env bash
# DOCU setup: gets a machine ready to work in this repo with a single
# command. Idempotent: safe to run as many times as needed.
# Linux, macOS and Windows with WSL2. Nothing requires sudo unless noted.
set -euo pipefail
cd "$(dirname "$0")/.."

BIN="$HOME/.local/bin"
mkdir -p "$BIN"
export PATH="$HOME/.bun/bin:$HOME/.opencode/bin:$BIN:$PATH"

c_ok=''; c_warn=''; c_err=''; c_end=''
if [ -t 1 ]; then c_ok=$'\033[32m'; c_warn=$'\033[33m'; c_err=$'\033[31m'; c_end=$'\033[0m'; fi
step() { printf '\n== %s ==\n' "$1"; }
ok()   { printf '%sOK%s     %s\n' "$c_ok" "$c_end" "$1"; }
warn() { printf '%sWARN%s  %s\n' "$c_warn" "$c_end" "$1"; warnings=$((warnings+1)); }
error(){ printf '%sERROR%s  %s\n' "$c_err" "$c_end" "$1"; exit 1; }
warnings=0

step "system"
os=$(uname -s); arch=$(uname -m)
case "$os" in
  Linux)  grep -qi microsoft /proc/version 2>/dev/null && ok "Windows + WSL2 ($arch)" || ok "Linux ($arch)" ;;
  Darwin) ok "macOS ($arch)" ;;
  *) error "Unsupported system $os. On Windows use WSL2: docs/operacion/BOOTSTRAP.md" ;;
esac
for t in git curl unzip; do command -v "$t" >/dev/null || error "missing '$t'. Install it with the system package manager and run again"; done
ok "git, curl and unzip are present"

step "git identity"
if [ -z "$(git config user.name || true)" ] || [ -z "$(git config user.email || true)" ]; then
  if [ -t 0 ]; then
    read -rp "Your name for commits: " n; git config --global user.name "$n"
    read -rp "Your GitHub email: " e; git config --global user.email "$e"
  else
    warn "git without user.name/user.email. Configure it: git config --global user.name ... / user.email ..."
  fi
fi
ok "commits signed as $(git config user.name) <$(git config user.email)>"

step "bun"
want_bun=$(sed -n 's/.*"packageManager": *"bun@\([0-9.]*\)".*/\1/p' package.json)
if [ "$(bun --version 2>/dev/null || true)" != "$want_bun" ]; then
  echo "installing bun $want_bun (in ~/.bun, no sudo)"
  curl -fsSL https://bun.sh/install | bash -s "bun-v$want_bun" >/dev/null 2>&1
fi
[ "$(bun --version)" = "$want_bun" ] || error "bun $(bun --version) != $want_bun"
ok "bun $want_bun"

step "github cli"
if ! command -v gh >/dev/null; then
  echo "installing gh in $BIN (no sudo)"
  tag=$(curl -fsSL https://api.github.com/repos/cli/cli/releases/latest | sed -n 's/.*"tag_name": *"v\([^"]*\)".*/\1/p' | head -1)
  case "$arch" in x86_64|amd64) a=amd64 ;; arm64|aarch64) a=arm64 ;; *) error "architecture $arch has no gh binary" ;; esac
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
  [ -t 0 ] || error "gh is not logged in. Run: gh auth login -h github.com -s project"
  echo "Log in with your GitHub account (a browser opens):"
  ghk auth login -h github.com -p https -w -s project
fi
if ! ghk auth status -h github.com 2>&1 | grep -q "'project'"; then
  if [ -t 0 ]; then ghk auth refresh -h github.com -s project; else warn "the gh session lacks the 'project' scope: gh auth refresh -h github.com -s project"; fi
fi
ok "gh logged in as $(gh api user --jq .login)"
if [ -n "${GITHUB_TOKEN:-}${GH_TOKEN:-}" ] && ! gh api -i user 2>/dev/null | grep -i '^x-oauth-scopes:' | grep -q project; then
  warn "your shell exports GITHUB_TOKEN/GH_TOKEN without the 'project' scope and gh uses it before your session. Drop the export or regenerate it with: env -u GITHUB_TOKEN gh auth token"
fi
repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null || true)
[ -n "$repo" ] && ok "access to repository $repo" || warn "no access to the GitHub repository. Ask the team lead to add you as a collaborator"

step "opencode"
if ! command -v opencode >/dev/null; then
  echo "installing opencode (in ~/.opencode, no sudo)"
  curl -fsSL https://opencode.ai/install | bash >/dev/null 2>&1
fi
command -v opencode >/dev/null || error "opencode did not land in PATH. Open another terminal and run again"
ok "opencode $(opencode --version 2>/dev/null | head -1)"

step "engram"
if command -v engram >/dev/null; then
  ok "engram $(engram --version 2>/dev/null | head -1)"
else
  warn "engram not installed. It is the project memory (docs/integraciones/ENGRAM.md). Ask the team lead for the binary (it goes in ~/.local/bin); the MCP already ships in the repo"
fi

step "docker"
if command -v docker >/dev/null && docker info >/dev/null 2>&1; then
  ok "$(docker --version | sed 's/,.*//')"
else
  warn "docker not available. In E1 it is only needed for 'bun run verify' (API smoke). Install Docker Desktop or Docker Engine"
fi

step "dependencies and hooks"
if [ ! -f .env ]; then cp .env.example .env; ok ".env created from .env.example (ask the team lead for the Drive credentials)"; else ok ".env already exists"; fi
bun install --frozen-lockfile >/dev/null 2>&1 || error "bun install failed. Run: bun install --frozen-lockfile"
ok "bun install (lefthook installed by postinstall)"

step "shell paths"
profile="$HOME/.bashrc"; case "${SHELL:-}" in */zsh) profile="$HOME/.zshrc" ;; esac
line='export PATH="$HOME/.bun/bin:$HOME/.opencode/bin:$HOME/.local/bin:$PATH"'
grep -qF "$line" "$profile" 2>/dev/null || { printf '\n# DOCU setup\n%s\n' "$line" >> "$profile"; ok "PATH added to $profile"; }
ok "bun, gh and opencode stay in the PATH of new terminals"

step "diagnostic"
bash scripts/doctor.sh | grep -E "MISSING|^OK=" || true

printf '\n-------------------------------------------\n'
printf 'Done (%s warning(s)). Next:\n' "$warnings"
printf '  1. Open a new terminal in this folder and run: opencode\n'
printf '  2. Inside opencode, the first time: /connect (pick a model provider)\n'
printf '  3. Then: /inicio   (it tells you who you are in the team, your tasks and the rules)\n'
