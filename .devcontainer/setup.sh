#!/usr/bin/env bash
set -euo pipefail

echo "Installing root npm deps…"
npm ci || npm install

echo "Installing frontend npm deps…"
npm --prefix projects/QuickStartTemplate-frontend ci || \
npm --prefix projects/QuickStartTemplate-frontend install

echo "Installing backend npm deps…"
npm --prefix projects/QuickStartTemplate-contracts ci || \
npm --prefix projects/QuickStartTemplate-contracts install

echo "Python libs…"
pip3 install -U pip
pip3 install py-algorand-sdk python-dotenv algokit-utils

echo "Generating app clients…"
( cd projects/QuickStartTemplate-frontend && npx -y algokit project link --all || true )

echo "Bootstrapping project…"
npx -y algokit project bootstrap all || true

echo "Devcontainer post-create setup complete."
