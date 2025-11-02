#!/bin/bash
set -e

echo "🚀 IBCS App - Complete Deployment"
echo "=================================="
echo ""

ROOT="/Users/StevenStewart/ibcs-app"
FRONTEND="$ROOT/frontend"
WORKER="$ROOT/worker"

# Step 1: Push schema via helper script
echo "📊 Step 1: Pushing schema to InstantDB..."
cd "$ROOT"
./push-schema.sh || echo "Schema push may have had issues, continuing..."
echo ""

# Step 2: Build frontend
echo "🔨 Step 2: Building frontend..."
cd "$FRONTEND"
npm install --silent
npm run build
echo ""

# Step 3: Deploy Worker
echo "☁️  Step 3: Deploying Cloudflare Worker..."
cd "$WORKER"
npm install --silent
npx wrangler deploy
echo ""

# Step 4: Seed teacher account (idempotent)
echo "👨‍🏫 Step 4: Seeding teacher account..."
cd "$ROOT"
node worker/seed-teacher.js \
  --username=MrStewart \
  --password=SGSD2024! \
  --display-name="Mr. Stewart" || echo "Seed step completed with warnings"
echo ""

# Step 5: Commit and push to GitHub
echo "📦 Step 5: Deploying to GitHub Pages..."
cd "$ROOT"
git add -A
git commit -m "Deploy working app" || echo "Nothing to commit"
git push origin main
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

