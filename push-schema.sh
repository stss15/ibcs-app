#!/bin/bash

# Push InstantDB Schema
# This script pushes your schema changes to InstantDB

echo "📊 Pushing schema to InstantDB..."
echo ""

# Make sure dependencies are installed
if [ ! -d "node_modules/@instantdb" ]; then
  echo "Installing dependencies..."
  npm install
  echo ""
fi

# Push schema using the app ID from instant.config.json
npx instant-cli push --app 83df1c1d-6e07-47fa-845b-a147c33850c6

echo ""
echo "✅ Done! Check your schema at: https://www.instantdb.com/dash"

