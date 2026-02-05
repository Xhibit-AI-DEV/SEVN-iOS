import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { toast } from 'sonner@2.0.3';
import { Loader2, X } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import imgChrisEdit from "figma:asset/d6d0374d1209d254e69a363bf2bd48de2a8fd831.png"; // Chris's featured edit image from landing page

interface ChrisWaitlistPageProps {
  uploadedImageUrl?: string;
}

export function ChrisWaitlistPage({ uploadedImageUrl }: ChrisWaitlistPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessedState = useRef(false);

  useEffect(() => {
    // Only process state once to avoid double-render issues
    if (hasProcessedState.current) {
      console.log('🔍 ChrisWaitlistPage - Already processed state, skipping');
      return;
    }

    // Get user's uploaded image from navigation state
    const intakeData = location.state as any;
    
    console.log('🔍 ChrisWaitlistPage - Received state:', intakeData);
    
    // Now we expect uploadedImageUrl (string) and orderId from the saved order
    if (!intakeData || !intakeData.uploadedImageUrl || !intakeData.orderId) {
      console.warn('⚠️ No intake data found - redirecting to Chris landing page');
      console.warn('Missing fields:', {
        hasState: !!intakeData,
        hasImageUrl: !!intakeData?.uploadedImageUrl,
        hasOrderId: !!intakeData?.orderId,
      });
      toast.error('Please complete the intake form first');
      navigate('/chris');
      return;
    }
    
    // Mark as processed
    hasProcessedState.current = true;
    
    // Store the data in component state
    setUserImageUrl(intakeData.uploadedImageUrl);
    setOrderId(intakeData.orderId);
    
    console.log('✅ State processed and stored:', {
      userImageUrl: intakeData.uploadedImageUrl,
      orderId: intakeData.orderId,
    });
    
    // DON'T show the popup yet - wait for user to click "JOIN WAITLIST"
  }, [navigate]); // Remove location.state from dependencies

  const handleJoinWaitlist = async () => {
    setIsSaving(true);

    try {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        toast.error('Please sign in to continue');
        navigate('/signin');
        return;
      }

      if (!orderId) {
        toast.error('No order found. Please start over.');
        navigate('/chris');
        return;
      }

      console.log('📝 Updating order status to waitlisted...');

      // Update order status to "waitlist" (NOT "waitlisted")
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/${orderId}/status`,
        {
          method: 'POST',  // Changed from PUT to POST
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            status: 'waitlist',  // Changed from 'waitlisted' to 'waitlist'
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join waitlist');
      }

      console.log('✅ Successfully joined waitlist');
      toast.success('You\'re on the waitlist!');
      
      // Keep modal open to show success
      setShowModal(true);
    } catch (error: any) {
      console.error('❌ Error joining waitlist:', error);
      toast.error(error.message || 'Failed to join waitlist. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoToInbox = () => {
    console.log('🚀 ========== NAVIGATING TO INBOX ==========');
    console.log('🚀 Current location:', window.location.href);
    console.log('🚀 About to navigate to: /customer-inbox');
    navigate('/customer-inbox');
    console.log('🚀 Navigate command executed');
    console.log('🚀 ==========================================');
  };

  return (
    <div className="w-full min-h-screen bg-[#fffefd] flex flex-col overflow-x-hidden">
      {/* Header with back button */}
      <div className="w-full px-6 pt-8 pb-6">
        <button
          onClick={() => navigate('/chris')}
          className="flex items-center gap-2 font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] uppercase cursor-pointer"
        >
          <span>←</span>
          <span>BACK</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-8">
        {/* Chris's Featured Edit Image from Landing Page - Stacked Card Effect */}
        <div className="relative w-full max-w-[361px] h-[480px] mb-8">
          {/* Back card - bottom right offset */}
          <div className="absolute top-[8px] left-[8px] right-0 bottom-0 border border-[#1e1709] rounded-[12px] bg-white" />
          
          {/* Middle card */}
          <div className="absolute top-[4px] left-[4px] right-[4px] bottom-[4px] border border-[#1e1709] rounded-[12px] bg-white" />
          
          {/* Front card with Chris's featured edit image */}
          <div className="absolute top-0 left-0 right-[8px] bottom-[8px] rounded-[12px] border border-[#1e1709] overflow-hidden">
            <img
              src={imgChrisEdit}
              alt="Chris's featured edit"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Title */}
        <div className="w-full max-w-[361px] mb-2">
          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] leading-[24px] tracking-[1px] text-[#1e1709]">
            CURATED EDIT → STYLE NOTES
          </p>
        </div>

        {/* Description */}
        <div className="w-full max-w-[361px] mb-16">
          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] leading-[24px] tracking-[1px] text-[#1e1709]">
            7 ITEM CAPSULE EDIT + STYLING NOTES CURATED BY CHRIS WHLY.
          </p>
        </div>

        {/* Price */}
        <div className="w-full max-w-[361px] mb-6">
          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] leading-[24px] tracking-[1px] text-[#1e1709]">
            100£
          </p>
        </div>

        {/* JOIN WAITLIST Button */}
        <div className="w-full max-w-[361px]">
          <button
            onClick={handleJoinWaitlist}
            disabled={isSaving}
            className="w-full h-[52px] bg-[#1E1709] rounded-[6px] font-['Helvetica_Neue:Bold',sans-serif] text-[16px] leading-[18px] text-[#fffefd] uppercase cursor-pointer hover:bg-[#2a2010] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                SAVING...
              </>
            ) : (
              'JOIN WAITLIST'
            )}
          </button>
        </div>
      </div>

      {/* Full-Screen Success Page - Shows after JOIN WAITLIST is clicked and saved */}
      {showModal && (
        <div className="fixed inset-0 bg-[#fffefd] z-50 flex flex-col overflow-x-hidden">
          {/* Header with back/close button */}
          <div className="w-full px-6 pt-8 pb-6">
            <button
              onClick={() => setShowModal(false)}
              className="flex items-center gap-2 font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] uppercase cursor-pointer"
            >
              <X className="w-5 h-5" />
              <span>CLOSE</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center px-4 pb-8">
            {/* User's uploaded image with stacked card effect */}
            {userImageUrl && (
              <div className="relative w-full max-w-[361px] h-[360px] mb-8">
                {/* Back card - most faded */}
                <div className="absolute inset-[2.22%] border border-[#1e1709] rounded-[8px] opacity-80 bg-white" />
                
                {/* Middle card */}
                <div className="absolute inset-[4.43%_0_0_4.43%] border border-[#1e1709] rounded-[8px] bg-white" />
                
                {/* Front card with actual image */}
                <div className="absolute inset-[0_4.43%_4.43%_0] rounded-[8px] border border-[#1e1709] overflow-hidden">
                  <img
                    src={userImageUrl}
                    alt="Your style"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Success message */}
            <div className="w-full max-w-[361px] mb-16 text-center">
              <p className="font-['Helvetica_Neue:Bold',sans-serif] text-[18px] leading-[24px] tracking-[2px] uppercase text-[#1e1709] mb-3">
                YOU'RE ON THE LIST
              </p>
              <p className="font-['Helvetica_Neue:Light',sans-serif] text-[12px] leading-[20px] tracking-[0.5px] text-[#1e1709]">
                Chris will review your request and send you a personalized invitation soon.
              </p>
            </div>

            {/* INBOX Button */}
            <div className="w-full max-w-[361px]">
              <button
                onClick={handleGoToInbox}
                className="w-full h-[52px] bg-[#1E1709] rounded-[6px] font-['Helvetica_Neue:Bold',sans-serif] text-[16px] leading-[18px] text-[#fffefd] uppercase cursor-pointer hover:bg-[#2a2010] transition-all"
              >
                INBOX
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}