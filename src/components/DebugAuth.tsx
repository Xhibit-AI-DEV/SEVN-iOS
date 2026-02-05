import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { Loader2 } from 'lucide-react';

export function DebugAuth() {
  const [email, setEmail] = useState('Lissy@sevn.app');
  const [newPassword, setNewPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);

  const checkUser = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/auth/check-user/${encodeURIComponent(email)}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        }
      );

      const data = await response.json();
      
      if (data.exists) {
        setUserExists(true);
        toast.success(`User found! ID: ${data.user_id}`);
        console.log('User data:', data);
      } else {
        setUserExists(false);
        toast.error('User not found. Please sign up first.');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      toast.error('Failed to check user');
    } finally {
      setIsChecking(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email,
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Password reset successfully! You can now sign in.');
        console.log('Reset result:', data);
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffefd] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#1e1709] rounded-[8px] p-6 w-full max-w-[400px]">
        <h1 className="font-['Helvetica_Neue:Bold',sans-serif] text-[24px] text-[#1e1709] mb-6 text-center">
          Auth Debug Tool
        </h1>

        {/* Email Input */}
        <div className="mb-4">
          <label className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] text-[#1e1709] uppercase tracking-[0.5px] mb-2 block">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-[5px] font-['Helvetica_Neue:Regular',sans-serif] text-[14px]"
          />
        </div>

        {/* Check User Button */}
        <button
          onClick={checkUser}
          disabled={isChecking}
          className="w-full bg-[#1e1709] text-white py-3 rounded-[5px] font-['Helvetica_Neue:Medium',sans-serif] text-[13px] tracking-[1px] uppercase mb-4 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking...
            </>
          ) : (
            'Check if User Exists'
          )}
        </button>

        {/* User Status */}
        {userExists !== null && (
          <div className={`p-3 rounded-[5px] mb-4 ${userExists ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px]">
              {userExists ? '✅ User exists in database' : '❌ User not found - please sign up'}
            </p>
          </div>
        )}

        {/* Reset Password Section */}
        {userExists && (
          <>
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1e1709] uppercase tracking-[0.5px] mb-3">
                Reset Password
              </h2>
              
              <label className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] text-[#1e1709] uppercase tracking-[0.5px] mb-2 block">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                className="w-full px-3 py-2 border border-gray-300 rounded-[5px] font-['Helvetica_Neue:Regular',sans-serif] text-[14px] mb-3"
              />

              <button
                onClick={resetPassword}
                disabled={isResetting || !newPassword}
                className="w-full bg-[#1e1709] text-white py-3 rounded-[5px] font-['Helvetica_Neue:Medium',sans-serif] text-[13px] tracking-[1px] uppercase disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </>
        )}

        {/* Instructions */}
        <div className="mt-6 p-3 bg-gray-50 rounded-[5px] border border-gray-200">
          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-gray-600 leading-relaxed">
            <strong>Instructions:</strong><br/>
            1. Check if your user exists<br/>
            2. If user exists, reset password<br/>
            3. Go to Sign In and use new password<br/>
            4. If user doesn't exist, go to Sign Up
          </p>
        </div>

        {/* Back to Sign In */}
        <a
          href="/signin"
          className="block text-center mt-4 font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] underline"
        >
          Back to Sign In
        </a>
      </div>
    </div>
  );
}