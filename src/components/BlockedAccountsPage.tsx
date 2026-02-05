import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

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
    // TODO: Fetch blocked users from backend
    // For now, show empty state
    setIsLoading(false);
  }, []);

  const handleUnblock = async (userId: string) => {
    // TODO: Implement unblock functionality
    console.log('Unblock user:', userId);
    setBlockedUsers(prev => prev.filter(user => user.id !== userId));
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
            Blocked Accounts
          </p>
          <div className="w-8" />
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-[393px] mx-auto px-4 pt-8 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709]/60">
              Loading...
            </p>
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
