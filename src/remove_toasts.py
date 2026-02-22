#!/usr/bin/env python3
"""
Script to comment out all toast imports and toast calls in the codebase
"""

import os
import re
from pathlib import Path

# Files to process
FILES_TO_PROCESS = [
    "components/WaitlistPage.tsx",
    "components/IntakeForm.tsx",
    "components/GenericWaitlistPage.tsx",
    "components/ChrisWaitlistPage.tsx",
    "components/LewisWaitlistPage.tsx",
    "components/DorianWaitlistPage.tsx",
    "components/MessagesPage.tsx",
    "components/MessageDetailPage.tsx",
    "components/CustomerOrderView.tsx",
    "components/CustomerInboxPage.tsx",
    "components/EditIntakeForm.tsx",
    "components/AdminDashboard.tsx",
    "components/StylistWorkspace.tsx",
    "components/SelectionsPanel.tsx",
    "components/GPTSearchPanel.tsx",
    "components/SignIn.tsx",
    "components/ProfilePage.tsx",
    "components/EditDetailPage.tsx",
    "components/CreateEditPage.tsx",
    "components/RorySelectsDetail.tsx",
    "components/EditProfileModal.tsx",
    "components/DebugAuth.tsx",
    "components/PasswordReset.tsx",
    "components/ChangePasswordPage.tsx",
    "components/ChangeEmailPage.tsx",
    "components/BlockedAccountsPage.tsx",
    "components/AdminCleanupPage.tsx",
    "components/DebugOrderCreation.tsx",
    "components/ForgotPasswordPage.tsx",
    "components/AdminProfileFix.tsx",
    "CustomerApp.tsx",
]

def remove_toasts_from_file(filepath):
    """Remove toast imports and calls from a file"""
    if not os.path.exists(filepath):
        print(f"⚠️  File not found: {filepath}")
        return False
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    original_content = content
    
    # Comment out toast imports
    content = re.sub(
        r'^import { toast } from',
        r'// import { toast } from',
        content,
        flags=re.MULTILINE
    )
    content = re.sub(
        r'^import { Toaster, toast } from',
        r'// import { Toaster, toast } from',
        content,
        flags=re.MULTILINE
    )
    
    # Comment out all toast. calls (preserving indentation)
    content = re.sub(
        r'^(\s*)toast\.',
        r'\1// toast.',
        content,
        flags=re.MULTILINE
    )
    
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"✅ Processed: {filepath}")
        return True
    else:
        print(f"⏭️  No changes needed: {filepath}")
        return False

def main():
    print("🧹 Starting toast removal from all files...\n")
    
    processed = 0
    skipped = 0
    errors = 0
    
    for filepath in FILES_TO_PROCESS:
        try:
            if remove_toasts_from_file(filepath):
                processed += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"❌ Error processing {filepath}: {e}")
            errors += 1
    
    print(f"\n📊 Summary:")
    print(f"   ✅ Processed: {processed}")
    print(f"   ⏭️  Skipped: {skipped}")
    print(f"   ❌ Errors: {errors}")
    print(f"\n✨ Toast removal complete!")

if __name__ == "__main__":
    main()
