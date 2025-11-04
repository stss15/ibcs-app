#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR"
FRONTEND="$ROOT/frontend"
WORKER="$ROOT/worker"

ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-AdminReset123!}"
ADMIN_FIRST_NAME="${ADMIN_FIRST_NAME:-Site}"
ADMIN_LAST_NAME="${ADMIN_LAST_NAME:-Administrator}"

TEACHER_USERNAME="${TEACHER_USERNAME:-MrStewart}"
TEACHER_PASSWORD="${TEACHER_PASSWORD:-SGSD2024!}"
TEACHER_DISPLAY_NAME="${TEACHER_DISPLAY_NAME:-Mr. Stewart}"
TEACHER_FIRST_NAME="${TEACHER_FIRST_NAME:-Mr.}"
TEACHER_LAST_NAME="${TEACHER_LAST_NAME:-Stewart}"

COMMIT_MESSAGE="${DEPLOY_COMMIT_MESSAGE:-Deploy $(date +'%Y-%m-%d %H:%M:%S')}"  

STEP=0

heading() {
  STEP=$((STEP + 1))
  echo ""
  printf "🔷  [%02d] %s\n" "$STEP" "$1"
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

ensure_main_branch() {
  local current_branch
  current_branch="$(git rev-parse --abbrev-ref HEAD)"
  if [ "$current_branch" != "main" ]; then
    echo "❌ Deployments must run from the 'main' branch (current: $current_branch)."
    echo "   Run: git checkout main && git pull --ff-only origin main"
    exit 1
  fi
}

ensure_clean_worktree() {
  local status
  status="$(git status --porcelain)"
  if [ -n "$status" ]; then
    echo "❌ Working tree is not clean. Commit or stash your changes before deploying."
    echo "$status"
    exit 1
  fi
}

run_or_warn() {
  local label="$1"
  shift
  if ! "$@"; then
    echo "⚠️  $label failed (see logs above). Continuing..."
  fi
}

# -----------------------------------------------------------------------------
# 0. Pre-flight checks
# -----------------------------------------------------------------------------
heading "Validating environment"

ensure_command git
ensure_command node
ensure_command npm
ensure_command npx

require_file "$ROOT/instant.config.json" "Create instant.config.json with your InstantDB credentials."

ensure_main_branch
ensure_clean_worktree

heading "Updating local main"
git fetch --prune origin
git pull --ff-only origin main

# -----------------------------------------------------------------------------
# 1. Push schema (optional but helpful)
# -----------------------------------------------------------------------------
heading "Pushing InstantDB schema"
run_or_warn "InstantDB schema push" "$ROOT/push-schema.sh"

# -----------------------------------------------------------------------------
# 2. Install dependencies & lint
# -----------------------------------------------------------------------------
heading "Installing frontend dependencies"
(cd "$FRONTEND" && npm install --silent)

heading "Installing worker dependencies"
(cd "$WORKER" && npm install --silent)

if [[ "${SKIP_LINT:-0}" != "1" ]]; then
  heading "Running frontend lint"
  (cd "$FRONTEND" && npm run lint)
fi

# -----------------------------------------------------------------------------
# 3. Build frontend & publish static bundle
# -----------------------------------------------------------------------------
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

# -----------------------------------------------------------------------------
# 4. Deploy worker & reset demo data
# -----------------------------------------------------------------------------
heading "Deploying Cloudflare Worker"
(cd "$WORKER" && npx wrangler deploy)

heading "Resetting InstantDB demo data"
run_or_warn "Database reset" node "$ROOT/worker/reset-db.js"

heading "Seeding admin account"
run_or_warn "Admin seed" node "$ROOT/worker/seed-admin.js" \
  --username="$ADMIN_USERNAME" \
  --password="$ADMIN_PASSWORD" \
  --first-name="$ADMIN_FIRST_NAME" \
  --last-name="$ADMIN_LAST_NAME"

heading "Seeding teacher account"
run_or_warn "Teacher seed" node "$ROOT/worker/seed-teacher.js" \
  --username="$TEACHER_USERNAME" \
  --password="$TEACHER_PASSWORD" \
  --display-name="$TEACHER_DISPLAY_NAME" \
  --first-name="$TEACHER_FIRST_NAME" \
  --last-name="$TEACHER_LAST_NAME"

# -----------------------------------------------------------------------------
# 5. Commit and push updated static bundle
# -----------------------------------------------------------------------------
heading "Committing static bundle"

if [ -d "$ROOT/assets" ]; then
  git add -A assets
fi
[ -f "$ROOT/index.html" ] && git add index.html
[ -f "$ROOT/404.html" ] && git add 404.html
[ -f "$ROOT/app-config.json" ] && git add app-config.json

if git diff --cached --quiet; then
  echo "ℹ️  No static changes detected. Skipping commit."
else
  git commit -m "$COMMIT_MESSAGE"
fi

heading "Pushing to origin/main"
git push origin main

# -----------------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------------
echo ""
echo "✅ Deployment complete!"
echo "🌐 Live site: https://stss15.github.io/ibcs-app/"
echo ""
echo "🔐 Seeded credentials (override via environment variables as needed):"
echo "   Admin   → $ADMIN_USERNAME / $ADMIN_PASSWORD"
echo "   Teacher → $TEACHER_USERNAME / $TEACHER_PASSWORD"
echo ""
echo "Tip: set SKIP_LINT=1 to bypass linting, or override DEPLOY_COMMIT_MESSAGE for a custom commit message."
echo ""

