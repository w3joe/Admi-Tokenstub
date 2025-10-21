#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Ensuring pipx is installed…"
if ! command -v pipx >/dev/null 2>&1; then
  sudo apt-get update -y
  sudo apt-get install -y pipx python3-venv
fi

echo "🔧 Ensuring ~/.local/bin is on PATH for this session…"
export PATH="$HOME/.local/bin:$PATH"

echo "📦 Installing / upgrading Algokit CLI via pipx…"
if command -v algokit >/dev/null 2>&1; then
  # upgrade if already present
  pipx upgrade algokit || true
else
  pipx install algokit
fi
# make sure PATH updates are persisted for future shells
pipx ensurepath || true

echo "🐍 Installing Python libraries…"
python3 -m pip install -U pip
python3 -m pip install -U py-algorand-sdk python-dotenv algokit-utils

# Workspace root (monorepo) — safe if package.json exists; otherwise skip
if [ -f package.json ]; then
  echo "🧰 Installing root npm deps…"
  ( npm ci || npm install )
fi

BUYERFE_DIR="QuickStartTemplate/projects/EventBuyerSite"
ORGANISERFE_DIR="QuickStartTemplate/projects/EventOrganiserScanner"
CONTRACTS_DIR="QuickStartTemplate/projects/Contracts"

echo "🧰 Installing frontend npm deps…"
if [ -f "$BUYERFE_DIR/package.json" ]; then
  ( npm --prefix "$BUYERFE_DIR" ci || npm --prefix "$BUYERFE_DIR" install )
  npm --prefix "$BUYERFE_DIR" install --save-dev @algorandfoundation/algokit-client-generator@latest
fi

# Install organiser scanner frontend deps if present
if [ -f "$ORGANISERFE_DIR/package.json" ]; then
  echo "🧰 Installing organiser scanner npm deps…"
  ( npm --prefix "$ORGANISERFE_DIR" ci || npm --prefix "$ORGANISERFE_DIR" install )
fi

echo "🧰 Installing contracts npm deps…"
if [ -f "$CONTRACTS_DIR/package.json" ]; then
  ( npm --prefix "$CONTRACTS_DIR" ci || npm --prefix "$CONTRACTS_DIR" install )
fi

echo "🧬 Generating app clients (non-interactive)…"
if [ -d "$BUYERFE_DIR" ]; then
  (
    cd "$BUYERFE_DIR"
    ALGOKIT_NO_INTERACTIVE=1 ALGOKIT_NO_SPINNER=1 \
    algokit project link --all || true
  )
fi

echo "🚀 Bootstrapping project (non-interactive)…"
ALGOKIT_NO_INTERACTIVE=1 ALGOKIT_NO_SPINNER=1 \
algokit project bootstrap all || true

echo "✅ Devcontainer post-create setup complete."
