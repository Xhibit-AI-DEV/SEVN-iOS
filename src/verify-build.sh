#!/bin/bash

echo "🔍 Build Verification Script"
echo "=============================="
echo ""

# Check if build directory exists
if [ ! -d "build" ]; then
  echo "❌ build/ directory not found!"
  echo "   Run: npm run build"
  exit 1
fi

echo "✅ build/ directory exists"
echo ""

# Check for index.html
if [ ! -f "build/index.html" ]; then
  echo "❌ build/index.html not found!"
  exit 1
fi

echo "✅ build/index.html exists"
echo ""

# Check for assets directory
if [ ! -d "build/assets" ]; then
  echo "❌ build/assets/ directory not found!"
  exit 1
fi

echo "✅ build/assets/ directory exists"
echo ""

# List CSS files
echo "📦 CSS files in build/assets:"
ls -lh build/assets/*.css 2>/dev/null || echo "   ⚠️  No CSS files found!"
echo ""

# List JS files
echo "📦 JS files in build/assets:"
ls -lh build/assets/*.js 2>/dev/null || echo "   ⚠️  No JS files found!"
echo ""

# Check asset paths in index.html
echo "🔗 Asset references in build/index.html:"
grep -E "(href|src)=" build/index.html | grep -E "\.(css|js)" || echo "   ⚠️  No asset references found!"
echo ""

# Check if paths are relative
if grep -q 'href="/assets' build/index.html || grep -q 'src="/assets' build/index.html; then
  echo "❌ ABSOLUTE PATHS DETECTED in build/index.html!"
  echo "   This will cause 404s in Capacitor."
  echo "   Expected: ./assets/..."
  echo "   Found:"
  grep -E '(href|src)="/assets' build/index.html
  echo ""
  echo "   Fix: Ensure vite.config.ts has base: './'"
  exit 1
else
  echo "✅ All paths appear to be relative (no leading /)"
fi

echo ""

# Check iOS public directory
if [ ! -d "ios/App/App/public" ]; then
  echo "⚠️  ios/App/App/public/ not found"
  echo "   Run: npx cap sync ios"
else
  echo "✅ ios/App/App/public/ exists"
  
  # Check if files are synced
  if [ -f "ios/App/App/public/index.html" ]; then
    echo "✅ iOS has index.html"
  else
    echo "❌ iOS missing index.html - run: npx cap sync ios"
  fi
  
  if [ -d "ios/App/App/public/assets" ]; then
    echo "✅ iOS has assets/ directory"
    echo ""
    echo "📦 iOS assets:"
    ls -lh ios/App/App/public/assets/*.css 2>/dev/null | head -3
    ls -lh ios/App/App/public/assets/*.js 2>/dev/null | head -3
  else
    echo "❌ iOS missing assets/ - run: npx cap sync ios"
  fi
fi

echo ""
echo "=============================="
echo "✅ Verification complete!"
