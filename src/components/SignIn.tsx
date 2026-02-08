import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true); // Default to sign-up for new customers
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check terms agreement for sign up
    if (isSignUp && !agreedToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/auth/signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Store auth token and user info (using both keys for compatibility)
          localStorage.setItem('auth_token', data.access_token);
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('user_email', email);
          localStorage.setItem('user_name', data.name || '');
          localStorage.setItem('user_id', data.user_id);
          localStorage.setItem('user_role', data.role || 'customer');
          
          toast.success('Account created! Welcome to SEVN.');
          
          // Redirect to home page
          navigate('/home');
        } else {
          const error = await response.json();
          const errorMessage = error.error || 'Failed to create account';
          toast.error(errorMessage);
          
          // If email exists, automatically switch to sign-in mode
          if (response.status === 409 || errorMessage.includes('already exists')) {
            setTimeout(() => {
              setIsSignUp(false);
              toast.info('Switched to sign in mode - please enter your password');
            }, 500);
          }
        }
      } else {
        // Sign in
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/auth/signin`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Store auth token and user info (using both keys for compatibility)
          localStorage.setItem('auth_token', data.access_token);
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('user_email', data.email);
          localStorage.setItem('user_name', data.name || '');
          localStorage.setItem('user_id', data.user_id);
          localStorage.setItem('user_role', data.role || 'customer');
          
          toast.success('Welcome back!');
          
          // Redirect to home page
          navigate('/home');
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to sign in');
          
          // If account doesn't exist, suggest signing up
          if (error.suggestion === 'signup') {
            setTimeout(() => {
              setIsSignUp(true);
              toast.info('Switched to sign up mode - create your account');
            }, 500);
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden overflow-y-auto bg-[#E2DFDD] flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)', WebkitOverflowScrolling: 'touch' }}>
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[393px]">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="font-['Helvetica_Neue:Bold',sans-serif] text-[32px] tracking-[4px] text-[#1E1709] uppercase mb-2">
              SEVN SELECTS
            </h1>
          </div>

          {/* Sign In/Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] text-[#1E1709] uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#1E1709]/20 rounded-lg font-['Helvetica_Neue:Regular',sans-serif] text-[16px] text-[#1E1709] bg-white focus:outline-none focus:border-[#1E1709]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] text-[#1E1709] uppercase mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-[#1E1709]/20 rounded-lg font-['Helvetica_Neue:Regular',sans-serif] text-[16px] text-[#1E1709] bg-white focus:outline-none focus:border-[#1E1709]"
                placeholder="••••••••"
              />
            </div>

            {isSignUp && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                  className="mr-2 shrink-0"
                  id="terms-checkbox"
                  style={{ accentColor: '#1E1709' }}
                />
                <label htmlFor="terms-checkbox" className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1E1709]/70">
                  I agree to the <a href="https://www.sevn.app/termsofservice" target="_blank" rel="noopener noreferrer" className="text-[#1E1709] hover:underline font-['Helvetica_Neue:Medium',sans-serif]">Terms of Service</a> and <a href="https://www.sevn.app/privacypolicy" target="_blank" rel="noopener noreferrer" className="text-[#1E1709] hover:underline font-['Helvetica_Neue:Medium',sans-serif]">Privacy Policy</a>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1E1709] text-white rounded-lg font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] uppercase hover:bg-[#1E1709]/90 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Toggle Sign In/Sign Up */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1E1709]/70 hover:text-[#1E1709] transition-colors"
            >
              {isSignUp ? (
                <>
                  Already have an account? <span className="font-['Helvetica_Neue:Medium',sans-serif] text-[#1E1709]">Sign In</span>
                </>
              ) : (
                <>
                  Don't have an account? <span className="font-['Helvetica_Neue:Medium',sans-serif] text-[#1E1709] underline">Sign Up</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}