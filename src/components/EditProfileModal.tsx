import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface EditProfileModalProps {
  userId: string;
  currentProfile: any;
  onClose: () => void;
  onUpdate: (profile: any) => void;
}

export function EditProfileModal({ userId, currentProfile, onClose, onUpdate }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(currentProfile?.display_name || currentProfile?.name || '');
  // IMPORTANT: Check 'username' field FIRST (this is the editable handle), NOT user_id (which might be the UUID)
  const [username, setUsername] = useState(currentProfile?.username || '');
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [websiteUrl, setWebsiteUrl] = useState(currentProfile?.website_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [userIdError, setUserIdError] = useState('');

  const handleUserIdChange = (value: string) => {
    // Remove spaces and convert to lowercase
    const sanitized = value.replace(/\s+/g, '').toLowerCase();
    setUsername(sanitized);
    
    // Clear error when user types
    if (userIdError) {
      setUserIdError('');
    }
  };

  const handleSave = async () => {
    // Validate User ID
    if (!username || username.trim() === '') {
      setUserIdError('User ID is required');
      return;
    }

    if (username.includes(' ')) {
      setUserIdError('User ID cannot contain spaces');
      return;
    }

    setIsUploading(true);

    try {
      const accessToken = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
      if (!accessToken) {
        return;
      }

      // Update profile (keep existing avatar_url)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/profiles/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            display_name: displayName,
            user_id: username,
            bio: bio,
            website_url: websiteUrl,
            avatar_url: currentProfile?.avatar_url || '',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes('already taken') || data.error?.includes('already exists')) {
          setUserIdError('This User ID is already taken');
          setIsUploading(false);
          return;
        }
        throw new Error(data.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully');
      onUpdate(data.profile);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
      setIsUploading(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white w-full max-w-[400px] rounded-[8px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[16px] tracking-[0.5px] text-[#1e1709] uppercase">
            Edit Profile
          </h2>
          <button onClick={onClose} className="p-1">
            <X className="w-5 h-5 text-[#1e1709]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {/* Display Name */}
          <div className="mb-4">
            <label className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] text-[#1e1709] uppercase tracking-[0.5px] mb-2 block">
              Display Name
            </label>
            <p className="text-[10px] text-gray-500 mb-2">Your name as it appears on your profile</p>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Collin Smith"
              className="w-full px-3 py-2 border border-gray-300 rounded-[5px] font-['Helvetica_Neue:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#1e1709]"
            />
          </div>

          {/* Username/Handle */}
          <div className="mb-4">
            <label className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] text-[#1e1709] uppercase tracking-[0.5px] mb-2 block">
              Username
            </label>
            <p className="text-[10px] text-gray-500 mb-2">Your unique handle (used in profile URLs). Lowercase, no spaces.</p>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUserIdChange(e.target.value)}
              placeholder="e.g., collin"
              className="w-full px-3 py-2 border border-gray-300 rounded-[5px] font-['Helvetica_Neue:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#1e1709]"
            />
            {userIdError && <p className="text-red-500 text-[12px] mt-1">{userIdError}</p>}
            <p className="text-[10px] text-gray-400 mt-1">sevn.com/u/{username || 'username'}</p>
          </div>

          {/* Bio */}
          <div className="mb-4">
            <label className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] text-[#1e1709] uppercase tracking-[0.5px] mb-2 block">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-[5px] font-['Helvetica_Neue:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#1e1709] resize-none"
            />
          </div>

          {/* Website URL */}
          <div className="mb-6">
            <label className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] text-[#1e1709] uppercase tracking-[0.5px] mb-2 block">
              Website
            </label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-[5px] font-['Helvetica_Neue:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#1e1709]"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isUploading}
            className="w-full bg-[#1e1709] text-white py-3 rounded-[5px] font-['Helvetica_Neue:Medium',sans-serif] text-[13px] tracking-[1px] uppercase hover:bg-[#2a2412] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}