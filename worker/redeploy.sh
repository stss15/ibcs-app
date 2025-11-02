#!/bin/bash
echo "🚀 Redeploying worker with ES module fix..."
cd /Users/StevenStewart/ibcs-app/worker
npx wrangler deploy
echo "✅ Done! Worker should now work correctly."

