import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) throw updateError;
      
      toast.success('Password updated successfully');
      navigate(-1);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[#fffefd]">
      {/* Header */}
      <div className="sticky top-0 bg-[#fffefd] h-[48px] w-full z-40 border-b border-[#1e1709]">
        <div className="h-full flex items-center justify-between px-4 max-w-[393px] mx-auto">
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
        <div className="flex flex-col gap-6">
          {/* Current Password */}
          <div className="flex flex-col gap-2">
            <label className="font-['Helvetica_Neue:Medium',sans-serif] text-[11px] tracking-[1.5px] text-[#1e1709]/60 uppercase">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-[48px] px-4 bg-white border border-[#1e1709] rounded-[4px] font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] focus:outline-none focus:ring-2 focus:ring-[#1e1709]/20"
              placeholder="Enter current password"
            />
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-2">
            <label className="font-['Helvetica_Neue:Medium',sans-serif] text-[11px] tracking-[1.5px] text-[#1e1709]/60 uppercase">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-[48px] px-4 bg-white border border-[#1e1709] rounded-[4px] font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] focus:outline-none focus:ring-2 focus:ring-[#1e1709]/20"
              placeholder="Enter new password"
            />
          </div>

          {/* Confirm New Password */}
          <div className="flex flex-col gap-2">
            <label className="font-['Helvetica_Neue:Medium',sans-serif] text-[11px] tracking-[1.5px] text-[#1e1709]/60 uppercase">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-[48px] px-4 bg-white border border-[#1e1709] rounded-[4px] font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] focus:outline-none focus:ring-2 focus:ring-[#1e1709]/20"
              placeholder="Confirm new password"
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
              {isLoading ? 'Updating...' : 'Update Password'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}