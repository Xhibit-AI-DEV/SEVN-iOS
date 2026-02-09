#!/bin/bash

echo "🚨 NUCLEAR CLEAN - Complete iOS Reset"
echo "======================================"

# 1. Kill everything
echo "1️⃣ Killing all iOS processes..."
killall Simulator 2>/dev/null
killall Xcode 2>/dev/null
pkill -9 -f Simulator 2>/dev/null
pkill -9 -f Xcode 2>/dev/null

# 2. Delete Xcode derived data
echo "2️⃣ Deleting Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# 3. Delete iOS simulator data
echo "3️⃣ Deleting ALL simulator data..."
xcrun simctl shutdown all
xcrun simctl erase all

# 4. Clean project builds
echo "4️⃣ Cleaning project build folders..."
rm -rf build
rm -rf ios/App/App/public
rm -rf node_modules/.vite

# 5. Clean iOS build folder
echo "5️⃣ Cleaning iOS build folder..."
rm -rf ios/App/build

# 6. Rebuild from scratch
echo "6️⃣ Building fresh..."
npm run build

# 7. Verify build
echo "7️⃣ Verifying build output..."
echo "   Title check:"
grep "<title>" build/index.html
echo ""
echo "   Script check:"
grep "CustomerApp" build/index.html

# 8. Copy to iOS
echo "8️⃣ Copying to iOS..."
npx cap copy ios

# 9. Verify iOS copy
echo "9️⃣ Verifying iOS public folder..."
ls -la ios/App/App/public/ | head -20

echo ""
echo "✅ NUCLEAR CLEAN COMPLETE"
echo "=========================="
echo "Next steps:"
echo "1. npx cap open ios"
echo "2. In Xcode: Product > Clean Build Folder (Cmd+Shift+K)"
echo "3. In Xcode: Product > Run (Cmd+R)"
echo "4. Check the version number on loading screen: should say 'BUILD v2.9.2025'"
