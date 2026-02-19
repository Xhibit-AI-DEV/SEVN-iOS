import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Pre-fill email from localStorage if available
  useEffect(() => {
    const userEmail = localStorage.getItem('user_email');
    if (userEmail) {
      setEmail(userEmail);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        setEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send reset email');
      }
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="relative w-full min-h-screen overflow-x-hidden bg-[#fffefd]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#fffefd] h-[48px] w-full z-40 border-b border-[#1e1709]">
        <div className="flex items-center h-full px-4 max-w-[393px] mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center hover:bg-[#1e1709]/10 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#1e1709]" strokeWidth={1.5} />
          </button>
          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[16px] tracking-[2px] text-[#1e1709] uppercase">
            Change Password
          </p>
          <div className="w-8" />
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-[393px] mx-auto px-4 pt-8">
        {!emailSent ? (
          <div className="flex flex-col gap-6">
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] leading-[20px] text-[#1e1709]/70">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="font-['Helvetica_Neue:Medium',sans-serif] text-[11px] tracking-[1.5px] text-[#1e1709]/60 uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[48px] px-4 bg-white border border-[#1e1709] rounded-[4px] font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] focus:outline-none focus:ring-2 focus:ring-[#1e1709]/20"
                placeholder="Enter your email"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-[52px] bg-[#1e1709] rounded-[4px] flex items-center justify-center hover:bg-[#3e3709] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <span className="font-['Helvetica_Neue:Bold',sans-serif] text-[16px] text-white uppercase">
                  Send Reset Link
                </span>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="font-['Helvetica_Neue:Bold',sans-serif] text-[18px] tracking-[1px] text-[#1e1709] uppercase">
              Check Your Email
            </h2>
            
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] leading-[20px] text-[#1e1709]">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] leading-[18px] text-[#1e1709]/70">
              If you don't see the email, check your spam folder.
            </p>

            <button
              onClick={() => navigate(-1)}
              className="w-full h-[52px] bg-[#1e1709] rounded-[4px] flex items-center justify-center hover:bg-[#3e3709] transition-colors mt-4"
            >
              <span className="font-['Helvetica_Neue:Bold',sans-serif] text-[16px] text-white uppercase">
                Back
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}