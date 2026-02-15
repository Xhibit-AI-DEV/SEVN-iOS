import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

export function ChangeEmailPage() {
  const navigate = useNavigate();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    if (!newEmail || !password) {
      setError('All fields are required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail
      });
      
      if (updateError) throw updateError;
      
      alert('Email update requested. Please check your new email to confirm the change.');
      navigate(-1);
    } catch (err: any) {
      setError(err.message || 'Failed to update email');
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
            Change Email
          </p>
          <div className="w-8" />
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-[393px] mx-auto px-4 pt-8">
        <div className="flex flex-col gap-6">
          {/* New Email */}
          <div className="flex flex-col gap-2">
            <label className="font-['Helvetica_Neue:Medium',sans-serif] text-[11px] tracking-[1.5px] text-[#1e1709]/60 uppercase">
              New Email Address
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full h-[48px] px-4 bg-white border border-[#1e1709] rounded-[4px] font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] focus:outline-none focus:ring-2 focus:ring-[#1e1709]/20"
              placeholder="Enter new email address"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label className="font-['Helvetica_Neue:Medium',sans-serif] text-[11px] tracking-[1.5px] text-[#1e1709]/60 uppercase">
              Confirm Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[48px] px-4 bg-white border border-[#1e1709] rounded-[4px] font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] focus:outline-none focus:ring-2 focus:ring-[#1e1709]/20"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-red-600">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full h-[52px] bg-[#1e1709] rounded-[4px] flex items-center justify-center hover:bg-[#3e3709] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            <span className="font-['Helvetica_Neue:Bold',sans-serif] text-[16px] text-white uppercase">
              {isLoading ? 'Updating...' : 'Update Email'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}