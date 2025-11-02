#!/bin/bash
echo "Testing worker endpoints..."
echo ""
echo "1. Testing root endpoint:"
curl -s https://ibcs-auth.stevengstewart25.workers.dev/ | head -20
echo ""
echo ""
echo "2. Testing seed endpoint:"
curl -s -X POST https://ibcs-auth.stevengstewart25.workers.dev/setup/seed \
  -H "Content-Type: application/json" \
  -H "x-seed-key: SGSD-seed-2024" \
  -d '{"teacher":{"username":"MrStewart","password":"SGSD2024!","displayName":"Mr. Stewart"}}' | head -20

