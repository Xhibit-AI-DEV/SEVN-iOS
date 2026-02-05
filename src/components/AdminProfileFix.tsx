import { useState } from 'react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { Loader2 } from 'lucide-react';

export function AdminProfileFix() {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [newUsername, setNewUsername] = useState('');

  const fetchCurrentProfile = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        toast.error('Please sign in first');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/profiles/me`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfileData(data.profile);
        setNewUsername(data.profile?.username || '');
        console.log('📋 Current profile:', data.profile);
        toast.success('Profile loaded!');
      } else {
        toast.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const updateUsername = async () => {
    if (!newUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        toast.error('Please sign in first');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/profiles/update-username`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            username: newUsername.trim(),
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfileData(data.profile);
        console.log('✅ Updated profile:', data.profile);
        toast.success('Username updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update username');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error updating username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffefd] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-['Helvetica_Neue:Bold',sans-serif] text-[32px] tracking-[2px] uppercase text-[#1e1709] mb-8">
          Profile Username Fix
        </h1>

        <div className="bg-white border border-[#1e1709] rounded-lg p-6 mb-6">
          <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[18px] uppercase text-[#1e1709] mb-4">
            Current Profile
          </h2>
          
          <button
            onClick={fetchCurrentProfile}
            disabled={loading}
            className="w-full h-[48px] bg-[#1e1709] text-white rounded-lg font-['Helvetica_Neue:Bold',sans-serif] text-[14px] uppercase mb-4 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              'Fetch My Profile'
            )}
          </button>

          {profileData && (
            <div className="bg-gray-50 rounded p-4 mb-4">
              <div className="space-y-2 font-mono text-sm">
                <div><strong>User ID (UUID):</strong> {profileData.user_id}</div>
                <div><strong>Current Username:</strong> {profileData.username || '(not set)'}</div>
                <div><strong>Display Name:</strong> {profileData.display_name || '(not set)'}</div>
                <div><strong>Email:</strong> {localStorage.getItem('user_email')}</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-[#1e1709] rounded-lg p-6">
          <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[18px] uppercase text-[#1e1709] mb-4">
            Update Username
          </h2>
          
          <div className="mb-4">
            <label className="block font-['Helvetica_Neue:Regular',sans-serif] text-[12px] uppercase text-[#1e1709] mb-2">
              New Username
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="e.g., lissy_roddy"
              className="w-full h-[48px] px-4 border border-[#1e1709] rounded-lg font-['Helvetica_Neue:Regular',sans-serif] text-[14px]"
            />
            <p className="mt-2 font-['Helvetica_Neue:Regular',sans-serif] text-[11px] text-[#1e1709]/60">
              For Lissy, this should be: <strong>lissy_roddy</strong>
            </p>
          </div>

          <button
            onClick={updateUsername}
            disabled={loading || !newUsername.trim()}
            className="w-full h-[48px] bg-[#1e1709] text-white rounded-lg font-['Helvetica_Neue:Bold',sans-serif] text-[14px] uppercase disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Username'
            )}
          </button>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-['Helvetica_Neue:Bold',sans-serif] text-[14px] uppercase text-yellow-900 mb-2">
            ⚠️ Important
          </h3>
          <ul className="list-disc list-inside space-y-1 font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-yellow-800">
            <li>Sign in as Lissy (Lissy@sevn.app)</li>
            <li>Set her username to: <strong>lissy_roddy</strong></li>
            <li>This must match the stylistId in IntakeForm.tsx</li>
            <li>Orders are indexed by username, not UUID</li>
          </ul>
        </div>
      </div>
    </div>
  );
}