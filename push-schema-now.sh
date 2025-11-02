#!/bin/bash
set -e

echo "📊 Installing dependencies and pushing schema to InstantDB..."
echo ""

cd /Users/StevenStewart/ibcs-app

# Install @instantdb/core so the schema file can load
npm install

# Push schema using CLI with app ID and token
npx instant-cli@latest push schema --app 83df1c1d-6e07-47fa-845b-a147c33850c6 --token eb523163-447b-4fac-bb0f-c262b7df2765 --yes

echo ""
echo "✅ Schema pushed successfully!"
echo ""
echo "Verify at: https://www.instantdb.com/dash"
echo "You should see: teachers, classes, students"

