#!/bin/bash

echo "============================================"
echo "  IBCS App - Cloudflare Worker Setup"
echo "============================================"
echo ""

# Check if wrangler is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js first."
    exit 1
fi

echo "Step 1: Checking Cloudflare login status..."
npx wrangler whoami

if [ $? -ne 0 ]; then
    echo ""
    echo "You need to login to Cloudflare."
    read -p "Login now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx wrangler login
    else
        echo "❌ Deployment cancelled. Run 'npx wrangler login' when ready."
        exit 1
    fi
fi

echo ""
echo "============================================"
echo "Step 2: InstantDB Setup"
echo "============================================"
echo ""
echo "📋 Go to https://www.instantdb.com/dash"
echo "   1. Click 'Create New App'"
echo "   2. Name it 'ibcs-app'"
echo "   3. Copy your App ID and Admin Token"
echo ""
read -p "Press ENTER when you have your InstantDB credentials ready..."

echo ""
echo "============================================"
echo "Step 3: Setting Worker Secrets"
echo "============================================"
echo ""

echo "🔑 Setting INSTANT_APP_ID..."
echo "Paste your InstantDB App ID:"
npx wrangler secret put INSTANT_APP_ID

echo ""
echo "🔑 Setting INSTANT_ADMIN_TOKEN..."
echo "Paste your InstantDB Admin Token:"
npx wrangler secret put INSTANT_ADMIN_TOKEN

echo ""
echo "🔑 Setting TOKEN_SECRET..."
echo "Generating a random token secret..."
TOKEN_SECRET=$(openssl rand -base64 32)
echo "Generated: $TOKEN_SECRET"
echo "$TOKEN_SECRET" | npx wrangler secret put TOKEN_SECRET

echo ""
echo "🔑 Setting SEED_KEY (for creating initial teacher)..."
read -p "Enter a secret seed key (or press ENTER for default): " SEED_KEY
if [ -z "$SEED_KEY" ]; then
    SEED_KEY="my-secret-seed-key-$(date +%s)"
fi
echo "$SEED_KEY" | npx wrangler secret put SEED_KEY
echo "Your seed key: $SEED_KEY (save this!)"

echo ""
echo "============================================"
echo "Step 4: Deploying Worker"
echo "============================================"
echo ""

npx wrangler deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "============================================"
    echo "✅ Deployment Successful!"
    echo "============================================"
    echo ""
    echo "📝 Next Steps:"
    echo ""
    echo "1. Update frontend config at:"
    echo "   frontend/public/app-config.json"
    echo "   with your InstantDB App ID and Admin Token"
    echo ""
    echo "2. Seed initial teacher account using:"
    echo "   curl -X POST https://YOUR-WORKER-URL.workers.dev/setup/seed \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -H 'x-seed-key: $SEED_KEY' \\"
    echo "     -d '{\"teacher\":{\"username\":\"MrStewart\",\"password\":\"YourPassword\",\"displayName\":\"Mr. Stewart\"}}'"
    echo ""
    echo "3. Test your app at http://localhost:5173"
    echo ""
    echo "🎉 Setup complete!"
else
    echo ""
    echo "❌ Deployment failed. Check the errors above."
    exit 1
fi

