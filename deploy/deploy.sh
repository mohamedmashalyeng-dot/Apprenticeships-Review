#!/usr/bin/env bash
# Run this on the VPS to pull the latest code and redeploy both frontend and backend.
# One-time setup (systemd service + Nginx site) is a separate step — see deploy/README.md.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

echo "==> Pulling latest code"
git pull origin master

echo "==> Backend: installing dependencies"
cd "$REPO_DIR/backend"
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
.venv/bin/pip install -q -r requirements.txt

echo "==> Backend: running migrations"
.venv/bin/python manage.py migrate --noinput

echo "==> Backend: collecting static files"
.venv/bin/python manage.py collectstatic --noinput

echo "==> Frontend: installing dependencies"
cd "$REPO_DIR/frontend"
npm install

echo "==> Frontend: building"
npm run build

echo "==> Restarting backend service"
sudo systemctl restart apprenticeships-backend

echo "==> Done. Backend status:"
sudo systemctl --no-pager status apprenticeships-backend
