#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# MyAlongside API — deploy script
#
# Run ON THE VM, from the repo root (e.g. /var/www/myalongside), as the
# unprivileged deploy user referenced in myalongside-backend.service. Pulls
# latest main, installs deps, generates the Prisma client, applies pending
# migrations, builds the backend, and restarts the systemd service.
#
# Usage: ./backend/deploy/deploy.sh
#
# Requires sudo rights limited to restarting this one service — see the
# visudo snippet at the bottom of this file.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "==> Fetching latest main"
git fetch origin main
git reset --hard origin/main

echo "==> Installing dependencies"
npm install

echo "==> Applying pending migrations"
npm run prisma:migrate:deploy

echo "==> Building backend"
npm run build --workspace=backend

echo "==> Restarting service"
sudo systemctl restart myalongside-backend

echo "==> Waiting for health check"
for i in $(seq 1 10); do
  if curl -fsS http://127.0.0.1:4000/health > /dev/null 2>&1; then
    echo "Backend is up."
    exit 0
  fi
  sleep 1
done

echo "Backend did not become healthy within 10s — check: journalctl -u myalongside-backend -n 100"
exit 1

# ─────────────────────────────────────────────────────────────────────────────
# One-time setup: let the deploy user restart the service without a password,
# without granting full sudo. Add via `sudo visudo -f /etc/sudoers.d/myalongside`:
#
#   deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart myalongside-backend
# ─────────────────────────────────────────────────────────────────────────────
