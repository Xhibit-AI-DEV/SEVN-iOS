import { X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOwnProfile: boolean;
  onDeleteAccount?: () => void;
  onBlockUser?: () => void;
  onLogout?: () => void;
}

export function MoreMenuModal({ 
  isOpen, 
  onClose, 
  isOwnProfile,
  onDeleteAccount,
  onBlockUser,
  onLogout
}: MoreMenuModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleChangePassword = () => {
    navigate('/change-password');
    onClose();
  };

  const handleChangeEmail = () => {
    navigate('/change-email');
    onClose();
  };

  const handlePrivacyPolicy = () => {
    navigate('/privacy-policy');
    onClose();
  };

  const handleTermsOfService = () => {
    navigate('/terms-of-service');
    onClose();
  };

  const handleBlockedAccounts = () => {
    navigate('/blocked-accounts');
    onClose();
  };
  
  const handleNotifications = () => {
    navigate('/notifications');
    onClose();
  };
  
  const handleHelpContact = () => {
    navigate('/help-contact');
    onClose();
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    onClose();
  };

  const handleDeleteAccount = () => {
    if (onDeleteAccount) {
      onDeleteAccount();
    }
    onClose();
  };

  const handleBlockUser = () => {
    if (onBlockUser) {
      onBlockUser();
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-[#FFFEFD] z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[48px] border-b border-[#1e1709] shrink-0">
        <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[16px] tracking-[2px] text-[#1e1709] uppercase">
          More
        </h2>
        <button 
          onClick={onClose} 
          className="w-8 h-8 flex items-center justify-center hover:bg-[#1e1709]/10 rounded transition-colors"
        >
          <X className="w-5 h-5 text-[#1e1709]" strokeWidth={1.5} />
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[393px] mx-auto">{/* Account Section - Only show on own profile */}
          {isOwnProfile && (
            <>
              <div className="px-4 pt-5 pb-2">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[11px] tracking-[1.5px] text-[#1e1709]/60 uppercase">
                  Account
                </p>
              </div>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Notifications clicked');
                  handleNotifications();
                }}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1e1709]/5 transition-colors border-b border-[#1e1709]/10 cursor-pointer"
              >
                <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[2px] text-[#1e1709] uppercase">
                  Notifications
                </span>
                <ChevronRight className="w-4 h-4 text-[#1e1709]" strokeWidth={1.5} />
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Change password clicked');
                  handleChangePassword();
                }}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1e1709]/5 transition-colors border-b border-[#1e1709]/10 cursor-pointer"
              >
                <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[2px] text-[#1e1709] uppercase">
                  Change Password
                </span>
                <ChevronRight className="w-4 h-4 text-[#1e1709]" strokeWidth={1.5} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Change email clicked');
                  handleChangeEmail();
                }}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1e1709]/5 transition-colors border-b border-[#1e1709]/10 cursor-pointer"
              >
                <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[2px] text-[#1e1709] uppercase">
                  Change Email
                </span>
                <ChevronRight className="w-4 h-4 text-[#1e1709]" strokeWidth={1.5} />
              </button>

              {/* Privacy & Safety Section */}
              <div className="px-4 pt-5 pb-2">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[11px] tracking-[1.5px] text-[#1e1709]/60 uppercase">
                  Privacy & Safety
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Blocked accounts clicked');
                  handleBlockedAccounts();
                }}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1e1709]/5 transition-colors border-b border-[#1e1709]/10 cursor-pointer"
              >
                <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[2px] text-[#1e1709] uppercase">
                  Blocked Accounts
                </span>
                <ChevronRight className="w-4 h-4 text-[#1e1709]" strokeWidth={1.5} />
              </button>
            </>
          )}

          {/* Block User - Only show when viewing another user's profile */}
          {!isOwnProfile && (
            <>
              <div className="px-4 pt-5 pb-2">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[11px] tracking-[1.5px] text-[#1e1709]/60 uppercase">
                  Privacy & Safety
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Block user clicked');
                  handleBlockUser();
                }}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1e1709]/5 transition-colors border-b border-[#1e1709]/10 cursor-pointer"
              >
                <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[2px] text-[#1e1709] uppercase">
                  Block User
                </span>
                <ChevronRight className="w-4 h-4 text-[#1e1709]" strokeWidth={1.5} />
              </button>
            </>
          )}

          {/* Legal Section */}
          <div className="px-4 pt-5 pb-2">
            <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[11px] tracking-[1.5px] text-[#1e1709]/60 uppercase">
              Legal
            </p>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Help & Contact clicked');
              handleHelpContact();
            }}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1e1709]/5 transition-colors border-b border-[#1e1709]/10 cursor-pointer"
          >
            <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[2px] text-[#1e1709] uppercase">
              Help & Contact
            </span>
            <ChevronRight className="w-4 h-4 text-[#1e1709]" strokeWidth={1.5} />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Privacy policy clicked');
              handlePrivacyPolicy();
            }}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1e1709]/5 transition-colors border-b border-[#1e1709]/10 cursor-pointer"
          >
            <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[2px] text-[#1e1709] uppercase">
              Privacy Policy
            </span>
            <ChevronRight className="w-4 h-4 text-[#1e1709]" strokeWidth={1.5} />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Terms of service clicked');
              handleTermsOfService();
            }}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1e1709]/5 transition-colors border-b border-[#1e1709]/10 cursor-pointer"
          >
            <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[2px] text-[#1e1709] uppercase">
              Terms of Service
            </span>
            <ChevronRight className="w-4 h-4 text-[#1e1709]" strokeWidth={1.5} />
          </button>

          {/* Logout - Only show on own profile */}
          {isOwnProfile && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Logout clicked');
                handleLogout();
              }}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1e1709]/5 transition-colors border-b border-[#1e1709]/10 cursor-pointer"
            >
              <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[2px] text-[#1e1709] uppercase">
                Logout
              </span>
              <ChevronRight className="w-4 h-4 text-[#1e1709]" strokeWidth={1.5} />
            </button>
          )}

          {/* Destructive Action - Delete Account - Only show on own profile */}
          {isOwnProfile && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Delete account clicked');
                handleDeleteAccount();
              }}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1e1709]/5 transition-colors border-b border-[#1e1709]/10 cursor-pointer"
            >
              <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[2px] text-[#1e1709] uppercase">
                Delete Account
              </span>
              <ChevronRight className="w-4 h-4 text-[#1e1709]" strokeWidth={1.5} />
            </button>
          )}

          {/* Bottom padding for safe area */}
          <div style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }} />
        </div>
      </div>
    </div>
  );
}