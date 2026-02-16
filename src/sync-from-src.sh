#!/bin/bash

# Sync configuration files from /src to root
# Run this script after every 'git pull' from Figma Make

echo "🔄 Syncing config files from /src to root..."

# Copy all config files
cp src/package.json package.json
cp src/package-lock.json package-lock.json 2>/dev/null || echo "⚠️  No package-lock.json in /src (will be generated on npm install)"
cp src/vite.config.ts vite.config.ts
cp src/capacitor.config.ts capacitor.config.ts
cp src/postcss.config.cjs postcss.config.cjs
cp src/tailwind.config.js tailwind.config.js
cp src/tsconfig.json tsconfig.json
cp src/tsconfig.node.json tsconfig.node.json 2>/dev/null || echo "⚠️  No tsconfig.node.json in /src"

echo "✅ Config files synced successfully!"
echo ""
echo "Next steps:"
echo "  1. npm install"
echo "  2. npm run build"
echo "  3. npx cap sync"
