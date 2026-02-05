import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function PasswordReset() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);

  const handleCheckUser = async () => {
    if (!email) {
      toast.error('Please enter an email');
      return;
    }

    setCheckingUser(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/auth/check-user/${encodeURIComponent(email)}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserExists(data.exists);
        if (data.exists) {
          toast.success(`User found! User ID: ${data.user_id}`);
        } else {
          toast.error('User not found. Please sign up first.');
        }
      } else {
        toast.error('Failed to check user');
      }
    } catch (error) {
      console.error('Check user error:', error);
      toast.error('Failed to check user');
    } finally {
      setCheckingUser(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !newPassword) {
      toast.error('Please enter email and new password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
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

      if (response.ok) {
        const data = await response.json();
        toast.success('Password reset successfully! You can now sign in.');
        setEmail('');
        setNewPassword('');
        setUserExists(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[393px]">
          <div className="text-center mb-8">
            <h1 className="font-['Helvetica_Neue:Bold',sans-serif] text-[32px] tracking-[4px] text-[#1e1709] uppercase mb-2">
              PASSWORD RESET
            </h1>
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-gray-600">
              Debug utility to reset your password
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] text-[#1e1709] uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setUserExists(null);
                }}
                className="w-full px-4 py-3 border border-black/20 rounded-lg font-['Helvetica_Neue:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#1e1709]"
                placeholder="you@example.com"
              />
            </div>

            <button
              onClick={handleCheckUser}
              disabled={checkingUser || !email}
              className="w-full py-2 bg-gray-200 text-[#1e1709] rounded-lg font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase hover:bg-gray-300 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {checkingUser ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Check if User Exists'
              )}
            </button>

            {userExists !== null && (
              <div className={`p-3 rounded-lg ${userExists ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] text-[#1e1709]">
                  {userExists ? '✅ User exists in database' : '❌ User not found'}
                </p>
              </div>
            )}
          </div>

          {userExists && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] text-[#1e1709] uppercase mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-black/20 rounded-lg font-['Helvetica_Neue:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#1e1709]"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1e1709] text-white rounded-lg font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] uppercase hover:bg-[#1e1709]/90 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <a
              href="/signin"
              className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-gray-600 hover:text-[#1e1709] transition-colors"
            >
              Back to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
