import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[393px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-[56px] border-b border-gray-200 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#1e1709]" strokeWidth={1.5} />
        </button>
        <h1 className="font-['Helvetica_Neue',sans-serif] text-[16px] tracking-[2px] text-[#1e1709] uppercase font-normal">
          RESET PASSWORD
        </h1>
        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-8">
        {!emailSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="font-['Helvetica_Neue',sans-serif] text-[14px] leading-[20px] text-[#1e1709] mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-3 border border-[#1e1709] rounded-[12px] font-['Helvetica_Neue',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1e1709]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-[#1e1709] text-white rounded-[16px] font-['Helvetica_Neue',sans-serif] text-[14px] tracking-[1px] uppercase font-medium hover:bg-[#2a2010] active:bg-[#3e3709] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>SENDING...</span>
                </div>
              ) : (
                'SEND RESET LINK'
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="font-['Helvetica_Neue',sans-serif] text-[18px] tracking-[1px] text-[#1e1709] font-medium">
              CHECK YOUR EMAIL
            </h2>
            
            <p className="font-['Helvetica_Neue',sans-serif] text-[14px] leading-[20px] text-[#1e1709]">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            
            <p className="font-['Helvetica_Neue',sans-serif] text-[12px] leading-[18px] text-[#1e1709] opacity-70">
              If you don't see the email, check your spam folder.
            </p>

            <button
              onClick={() => navigate('/auth')}
              className="w-full h-[52px] bg-[#1e1709] text-white rounded-[16px] font-['Helvetica_Neue',sans-serif] text-[14px] tracking-[1px] uppercase font-medium hover:bg-[#2a2010] transition-colors mt-8"
            >
              BACK TO LOGIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
