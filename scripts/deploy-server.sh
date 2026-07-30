#!/usr/bin/env bash
# Deploy en el servidor (opsai.reliability.space + PM2)
# Uso: bash scripts/deploy-server.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Pull"
git pull --ff-only origin main

echo "==> Install"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "==> Build"
npm run build

mkdir -p logs

echo "==> PM2"
if pm2 describe opsai-reliability >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save
pm2 status opsai-reliability

echo "==> Listo · https://opsai.reliability.space"
