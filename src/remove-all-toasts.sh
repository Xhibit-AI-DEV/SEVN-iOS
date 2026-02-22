#!/bin/bash

# Script to remove all toast imports and calls from the codebase

echo "🧹 Starting toast removal across all files..."

# Find all TypeScript/TSX files with toast imports
files_with_toast=$(grep -rl "import.*toast.*from" components/ CustomerApp.tsx --include="*.tsx" --include="*.ts" 2>/dev/null)

for file in $files_with_toast; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # Comment out toast imports
    sed -i.bak "s/^import { toast } from/\/\/ import { toast } from/g" "$file"
    sed -i.bak "s/^import { Toaster, toast } from/\/\/ import { Toaster, toast } from/g" "$file"
    
    # Comment out all toast. calls
    sed -i.bak "s/^[[:space:]]*toast\./\/\/ toast./g" "$file"
    
    # Remove backup files
    rm -f "$file.bak"
  fi
done

echo "✅ Toast removal complete!"
echo "📝 Modified files:"
echo "$files_with_toast"
