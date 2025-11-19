#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR"
FRONTEND="$ROOT/frontend"
WORKER="$ROOT/worker"

heading() {
  printf "\n🔷  %s\n" "$1"
}

ensure_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "❌ Required command '$1' is not available."
    exit 1
  fi
}

require_file() {
  local file="$1"
  local help="$2"
  if [ ! -f "$file" ]; then
    echo "❌ Missing required file: $file"
    if [ -n "$help" ]; then
      echo "   $help"
    fi
    exit 1
  fi
}

ensure_clean_worktree() {
  if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Working tree is not clean. Commit or stash changes first."
    exit 1
  fi
}

heading "Validating environment"
ensure_command git
ensure_command npm
ensure_command npx
require_file "$ROOT/instant.config.json" 'Create instant.config.json with InstantDB credentials.'
ensure_clean_worktree

heading "Updating local main"
git fetch --prune origin
git pull --ff-only origin main

heading "Pushing schema"
$ROOT/push-schema.sh

heading "Installing frontend dependencies"
(cd "$FRONTEND" && npm install --silent)

heading "Installing worker dependencies"
(cd "$WORKER" && npm install --silent)

heading "Running frontend lint"
(cd "$FRONTEND" && npm run lint)

heading "Building frontend"
(cd "$FRONTEND" && npm run build)

heading "Publishing static bundle"
cd "$ROOT"
rm -rf assets
rm -f index.html 404.html app-config.json
if [ -d "$FRONTEND/dist/assets" ]; then
  cp -R "$FRONTEND/dist/assets" ./assets
fi
if [ -f "$FRONTEND/dist/index.html" ]; then
  cp "$FRONTEND/dist/index.html" ./index.html
  cp "$FRONTEND/dist/index.html" ./404.html
fi
if [ -f "$FRONTEND/dist/app-config.json" ]; then
  cp "$FRONTEND/dist/app-config.json" ./app-config.json
fi

heading "Deploying worker"
(cd "$WORKER" && npx wrangler deploy)

echo "\n✅ Deployment complete"
