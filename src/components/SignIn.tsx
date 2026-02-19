import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import viiLogo from 'figma:asset/4ec03ff54a95119f5d32d5425296f54905e0e776.png';

/**
 * SignIn Component - Handles both sign up and sign in flows
 * 
 * EARLY ACCESS CODE: 19xx99
 * All users (new and existing) must enter this code to access the app
 * 
 * Flow:
 * 1. User enters early access code (required)
 * 2. User enters email and password
 * 3. For sign up: must agree to terms
 * 4. Code is validated client-side before API call
 */

export function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [earlyAccessCode, setEarlyAccessCode] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Default to sign-in (not sign-up)
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false); // Track if user passed early access

  const handleEarlyAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate early access code
    if (earlyAccessCode !== '19xx99') {
      toast.error('Invalid early access code');
      return;
    }
    
    // Code is valid, show the auth form
    toast.success('Access code verified!');
    setShowAuthForm(true);
  };

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
          
          // Reload the page to ensure auth state is properly updated everywhere
          window.location.href = '/home';
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
          
          // Dispatch auth changed event to update CustomerApp state
          window.dispatchEvent(new Event('authChanged'));
          
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
    <div 
      className="fixed inset-0 w-full overflow-x-hidden overflow-y-auto bg-[#EBE9E7]" 
      style={{ 
        top: 'env(safe-area-inset-top, 0)', 
        bottom: 'env(safe-area-inset-bottom, 0)',
        left: 0,
        right: 0,
        WebkitOverflowScrolling: 'touch',
        height: '100vh',
        minHeight: '-webkit-fill-available'
      }}
    >
      {/* Main Content */}
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="w-full max-w-[393px] px-6">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            {/* V22 Text Logo - Using Dirtyline font specimen image */}
            <div className="mb-5 flex justify-center">
              <img 
                src={viiLogo} 
                alt="Vii Logo" 
                className="h-32 object-contain"
              />
            </div>
            
            {/* SEVN SELECTS - increased letter spacing for editorial feel */}
            <h2 className="font-['Helvetica_Neue:Bold',sans-serif] text-[16px] tracking-[5.6px] text-[#1E1709]/95 uppercase">
              SEVN SELECTS
            </h2>
          </div>

          {/* Early Access Form */}
          {!showAuthForm && (
            <form onSubmit={handleEarlyAccessSubmit} className="space-y-7">
              {/* Early Access Code - Fashion-forward underline style */}
              <div>
                <input
                  type="text"
                  value={earlyAccessCode}
                  onChange={(e) => setEarlyAccessCode(e.target.value)}
                  required
                  className="w-full px-0 py-4 border-0 border-b-[2px] border-b-[#1E1709]/30 rounded-none font-['Helvetica_Neue:Medium',sans-serif] text-[16px] text-[#1E1709] bg-transparent focus:outline-none focus:border-b-[#1E1709] transition-all placeholder:text-[#1E1709]/70"
                  placeholder="Early Access Code"
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-0 py-7 bg-gradient-to-b from-[#2a1a05] to-[#201303] text-white rounded-sm font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[3.2px] uppercase hover:opacity-90 active:brightness-95 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'CONTINUE'
                )}
              </button>
            </form>
          )}

          {/* Sign In/Sign Up Form */}
          {showAuthForm && (
            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="mb-10">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-0 py-4 border-0 border-b-[2px] border-b-[#1E1709]/30 rounded-none font-['Helvetica_Neue:Medium',sans-serif] text-[16px] text-[#1E1709] bg-transparent focus:outline-none focus:border-b-[#1E1709] transition-all placeholder:text-[#1E1709]/70"
                  placeholder="Email"
                />
              </div>

              {/* Password Field */}
              <div className="mb-10">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-0 py-4 border-0 border-b-[2px] border-b-[#1E1709]/30 rounded-none font-['Helvetica_Neue:Medium',sans-serif] text-[16px] text-[#1E1709] bg-transparent focus:outline-none focus:border-b-[#1E1709] transition-all placeholder:text-[#1E1709]/70"
                  placeholder="Password"
                />
              </div>

              {/* Terms Checkbox for Sign Up */}
              {isSignUp && (
                <div className="flex items-start mb-10">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    required
                    className="mt-0.5 mr-3 shrink-0"
                    id="terms-checkbox"
                    style={{ accentColor: '#1E1709' }}
                  />
                  <label htmlFor="terms-checkbox" className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] leading-[20px] text-[#1E1709]/75">
                    I agree to the <a href="https://www.sevn.app/termsofservice" target="_blank" rel="noopener noreferrer" className="text-[#1E1709] hover:underline font-['Helvetica_Neue:Medium',sans-serif]">Terms of Service</a> and <a href="https://www.sevn.app/privacypolicy" target="_blank" rel="noopener noreferrer" className="text-[#1E1709] hover:underline font-['Helvetica_Neue:Medium',sans-serif]">Privacy Policy</a>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-0 py-7 bg-gradient-to-b from-[#2a1a05] to-[#201303] text-white rounded-sm font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[3.2px] uppercase hover:opacity-90 active:brightness-95 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'
                )}
              </button>
            </form>
          )}

          {/* Toggle Sign In/Sign Up and Forgot Password - Same Line */}
          {showAuthForm && !isSignUp && (
            <div className="mt-6 px-0 text-left">
              <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1E1709]/70">
                Don't have an account?{' '}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-['Helvetica_Neue:Medium',sans-serif] text-[#1E1709] hover:text-[#1E1709]/70 transition-colors underline"
                >
                  Sign Up
                </button>
                {' '}
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="font-['Helvetica_Neue:Medium',sans-serif] text-[#1E1709] hover:text-[#1E1709]/70 transition-colors underline"
                >
                  Forgot Password?
                </button>
              </span>
            </div>
          )}

          {/* Toggle to Sign In - Only show in sign up mode */}
          {showAuthForm && isSignUp && (
            <div className="mt-6 px-0 text-left">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1E1709]/70 hover:text-[#1E1709] transition-colors"
              >
                Already have an account? <span className="font-['Helvetica_Neue:Medium',sans-serif] text-[#1E1709]\">Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}