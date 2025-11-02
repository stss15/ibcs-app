#!/bin/bash
set -e

echo "🚀 IBCS App - Complete Deployment"
echo "=================================="
echo ""

APP_ID="83df1c1d-6e07-47fa-845b-a147c33850c6"
ADMIN_TOKEN="eb523163-447b-4fac-bb0f-c262b7df2765"
WORKER_URL="https://ibcs-auth.stevengstewart25.workers.dev"

# Step 1: Push schema via InstantDB CLI
echo "📊 Step 1: Pushing schema to InstantDB..."
cd /Users/StevenStewart/ibcs-app
npx instant-cli@latest push schema --app "$APP_ID" --token "$ADMIN_TOKEN" --yes 2>&1 || echo "Schema push may have had issues, continuing..."
echo ""

# Step 2: Build frontend
echo "🔨 Step 2: Building frontend..."
cd /Users/StevenStewart/ibcs-app/frontend
npm install --silent
npm run build
echo ""

# Step 3: Deploy Worker
echo "☁️  Step 3: Deploying Cloudflare Worker..."
cd /Users/StevenStewart/ibcs-app/worker
npx wrangler deploy
echo ""

# Step 4: Seed teacher account
echo "👨‍🏫 Step 4: Seeding teacher account..."
curl -X POST "$WORKER_URL/setup/seed" \
  -H "Content-Type: application/json" \
  -H "x-seed-key: SGSD-seed-2024" \
  -d '{
    "teacher": {
      "username": "MrStewart",
      "password": "SGSD2024!",
      "displayName": "Mr. Stewart"
    }
  }'
echo ""
echo ""

# Step 5: Commit and push to GitHub
echo "📦 Step 5: Deploying to GitHub Pages..."
cd /Users/StevenStewart/ibcs-app
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

