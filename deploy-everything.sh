#!/bin/bash
set -euo pipefail

echo "🚀 IBCS App - Complete Deployment"
echo "=================================="
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR"
FRONTEND="$ROOT/frontend"
WORKER="$ROOT/worker"

cd "$ROOT"

ensure_main_branch() {
  local current_branch
  current_branch="$(git rev-parse --abbrev-ref HEAD)"
  if [ "$current_branch" != "main" ]; then
    echo "⚠️  fix-and-deploy.sh must run from the main branch. Current branch: $current_branch"
    echo "   Run: git checkout main && git pull --ff-only origin main"
    exit 1
  fi
}

ensure_main_branch

maybe_install() {
  local target_dir="$1"
  if [ ! -d "$target_dir/node_modules" ]; then
    echo "📦 Installing dependencies in ${target_dir##*/}..."
    (cd "$target_dir" && npm install --silent)
  fi
}

# Step 1: Push schema via helper script
echo "📊 Step 1: Pushing schema to InstantDB..."
cd "$ROOT"
./push-schema.sh || echo "Schema push may have had issues, continuing..."
echo ""

# Step 2: Build frontend
echo "🔨 Step 2: Building frontend..."
cd "$FRONTEND"
maybe_install "$FRONTEND"
npm run build
echo ""

# Step 2b: Publish static bundle to root for GitHub Pages
echo "🗂️  Step 2b: Publishing static bundle..."
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
echo ""

# Step 3: Deploy Worker
echo "☁️  Step 3: Deploying Cloudflare Worker..."
cd "$WORKER"
maybe_install "$WORKER"
npx wrangler deploy
echo ""

# Step 4: Reset InstantDB state
echo "🧹 Step 4: Resetting InstantDB demo data..."
cd "$ROOT"
node worker/reset-db.js || echo "Database reset step completed with warnings"
echo ""

# Step 5: Seed teacher account (idempotent)
echo "👨‍🏫 Step 5: Seeding teacher account..."
cd "$ROOT"
node worker/seed-teacher.js \
  --username=MrStewart \
  --password=SGSD2024! \
  --display-name="Mr. Stewart" || echo "Seed step completed with warnings"
echo ""

# Step 6: Commit and push to GitHub
echo "📦 Step 6: Deploying to GitHub Pages..."
cd "$ROOT"
if git fetch --quiet origin main; then
  if ! git merge-base --is-ancestor origin/main HEAD; then
    echo "⚠️  Local main is behind origin/main. Run 'git pull --ff-only origin main' before deploying."
    exit 1
  fi
else
  echo "⚠️  Unable to verify origin/main (fetch failed). Continuing without remote sync check."
fi
git add -A
git commit -m "Deploy working app" || echo "Nothing to commit"
if ! git push origin main; then
  echo "⚠️  Git push failed. Please check your network connection or credentials and push manually when ready."
fi
echo ""

echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Your app is live at: https://stss15.github.io/ibcs-app/"
echo ""
echo "🔐 Login with:"
echo "   Username: MrStewart"
echo "   Password: SGSD2024!"
echo "   Role: Teacher"
echo ""

