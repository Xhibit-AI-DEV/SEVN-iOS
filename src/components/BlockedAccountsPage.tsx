import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';

interface BlockedUser {
  id: string;
  username: string;
  avatar_url?: string;
}

export function BlockedAccountsPage() {
  const navigate = useNavigate();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        
        if (!accessToken) {
          console.error('No access token found');
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/blocks`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.error('Failed to fetch blocked users:', response.status);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setBlockedUsers(data.blocked_users || []);
      } catch (error) {
        console.error('Error fetching blocked users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlockedUsers();
  }, []);

  const handleUnblock = async (userId: string) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        toast.error('You must be logged in to unblock users');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/blocks/unblock`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ blocked_user_id: userId }),
        }
      );

      if (!response.ok) {
        toast.error('Failed to unblock user');
        return;
      }

      setBlockedUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('User unblocked successfully');
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
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
            Blocked Accounts
          </p>
          <div className="w-8" />
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-[393px] mx-auto px-4 pt-8 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-[#1e1709]/60 animate-spin" />
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709]/60 text-center">
              No blocked accounts
            </p>
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709]/40 text-center px-8">
              When you block someone, they won't be able to see your profile or interact with you.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {blockedUsers.map((user) => (
              <div 
                key={user.id}
                className="flex items-center justify-between p-4 bg-white border border-[#1e1709]/10 rounded-[4px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-[48px] h-[48px] rounded-full bg-[#1e1709]/10 overflow-hidden">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709]">
                    {user.username}
                  </p>
                </div>
                <button
                  onClick={() => handleUnblock(user.id)}
                  className="px-4 h-[36px] bg-[#1e1709] rounded-[4px] hover:bg-[#3e3709] transition-colors"
                >
                  <span className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] text-white uppercase">
                    Unblock
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}