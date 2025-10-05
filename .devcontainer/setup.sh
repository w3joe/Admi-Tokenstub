#!/usr/bin/env bash
set -euo pipefail

# Node / npm deps (root)
echo "Installing root npm deps…"
npm ci || npm install

# Frontend deps
echo "Installing frontend npm deps…"
npm --prefix projects/QuickStartTemplate-frontend ci || \
npm --prefix projects/QuickStartTemplate-frontend install

# Python tooling
echo "Installing Python tooling…"
pipx install algokit || true
pip3 install -U pip
pip3 install py-algorand-sdk python-dotenv algokit-utils

# One-time codegen
echo "Generating app clients…"
( cd projects/QuickStartTemplate-frontend && npx -y algokit project link --all || true )

echo "Devcontainer post-create setup complete."
