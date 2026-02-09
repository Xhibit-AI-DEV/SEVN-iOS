import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface NotificationSettings {
  order_updates: boolean;
  new_messages: boolean;
  stylist_invites: boolean;
  selection_ready: boolean;
  marketing_emails: boolean;
  push_notifications: boolean;
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<NotificationSettings>({
    order_updates: true,
    new_messages: true,
    stylist_invites: true,
    selection_ready: true,
    marketing_emails: false,
    push_notifications: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (key: keyof NotificationSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key]
    };
    setSettings(newSettings);
    
    // TODO: Save to backend
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
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
            Notifications
          </p>
          <div className="w-8" />
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-[393px] mx-auto px-4 pt-8 pb-24">
        <div className="flex flex-col">
          {/* Section: Order Updates */}
          <div className="py-4 border-b border-[#1e1709]/10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1e1709] uppercase tracking-[2px]">
                  Order Updates
                </p>
                <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709]/60">
                  Get notified about your order status
                </p>
              </div>
              <button
                onClick={() => handleToggle('order_updates')}
                className={`relative w-[48px] h-[28px] rounded-full transition-colors ${
                  settings.order_updates ? 'bg-[#1e1709]' : 'bg-[#1e1709]/20'
                }`}
              >
                <div className={`absolute top-[2px] w-[24px] h-[24px] bg-white rounded-full transition-all ${
                  settings.order_updates ? 'left-[22px]' : 'left-[2px]'
                }`} />
              </button>
            </div>
          </div>

          {/* Section: New Messages */}
          <div className="py-4 border-b border-[#1e1709]/10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1e1709] uppercase tracking-[2px]">
                  New Messages
                </p>
                <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709]/60">
                  Get notified about new messages
                </p>
              </div>
              <button
                onClick={() => handleToggle('new_messages')}
                className={`relative w-[48px] h-[28px] rounded-full transition-colors ${
                  settings.new_messages ? 'bg-[#1e1709]' : 'bg-[#1e1709]/20'
                }`}
              >
                <div className={`absolute top-[2px] w-[24px] h-[24px] bg-white rounded-full transition-all ${
                  settings.new_messages ? 'left-[22px]' : 'left-[2px]'
                }`} />
              </button>
            </div>
          </div>

          {/* Section: Stylist Invites */}
          <div className="py-4 border-b border-[#1e1709]/10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1e1709] uppercase tracking-[2px]">
                  Stylist Invites
                </p>
                <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709]/60">
                  Get notified when stylists invite you
                </p>
              </div>
              <button
                onClick={() => handleToggle('stylist_invites')}
                className={`relative w-[48px] h-[28px] rounded-full transition-colors ${
                  settings.stylist_invites ? 'bg-[#1e1709]' : 'bg-[#1e1709]/20'
                }`}
              >
                <div className={`absolute top-[2px] w-[24px] h-[24px] bg-white rounded-full transition-all ${
                  settings.stylist_invites ? 'left-[22px]' : 'left-[2px]'
                }`} />
              </button>
            </div>
          </div>

          {/* Section: Selection Ready */}
          <div className="py-4 border-b border-[#1e1709]/10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1e1709] uppercase tracking-[2px]">
                  Selection Ready
                </p>
                <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709]/60">
                  Get notified when your selection is ready
                </p>
              </div>
              <button
                onClick={() => handleToggle('selection_ready')}
                className={`relative w-[48px] h-[28px] rounded-full transition-colors ${
                  settings.selection_ready ? 'bg-[#1e1709]' : 'bg-[#1e1709]/20'
                }`}
              >
                <div className={`absolute top-[2px] w-[24px] h-[24px] bg-white rounded-full transition-all ${
                  settings.selection_ready ? 'left-[22px]' : 'left-[2px]'
                }`} />
              </button>
            </div>
          </div>

          {/* Section: Marketing Emails */}
          <div className="py-4 border-b border-[#1e1709]/10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1e1709] uppercase tracking-[2px]">
                  Marketing Emails
                </p>
                <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709]/60">
                  Receive promotional content and updates
                </p>
              </div>
              <button
                onClick={() => handleToggle('marketing_emails')}
                className={`relative w-[48px] h-[28px] rounded-full transition-colors ${
                  settings.marketing_emails ? 'bg-[#1e1709]' : 'bg-[#1e1709]/20'
                }`}
              >
                <div className={`absolute top-[2px] w-[24px] h-[24px] bg-white rounded-full transition-all ${
                  settings.marketing_emails ? 'left-[22px]' : 'left-[2px]'
                }`} />
              </button>
            </div>
          </div>

          {/* Section: Push Notifications */}
          <div className="py-4 border-b border-[#1e1709]/10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1e1709] uppercase tracking-[2px]">
                  Push Notifications
                </p>
                <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709]/60">
                  Enable push notifications on your device
                </p>
              </div>
              <button
                onClick={() => handleToggle('push_notifications')}
                className={`relative w-[48px] h-[28px] rounded-full transition-colors ${
                  settings.push_notifications ? 'bg-[#1e1709]' : 'bg-[#1e1709]/20'
                }`}
              >
                <div className={`absolute top-[2px] w-[24px] h-[24px] bg-white rounded-full transition-all ${
                  settings.push_notifications ? 'left-[22px]' : 'left-[2px]'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}