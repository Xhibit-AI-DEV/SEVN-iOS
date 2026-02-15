import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';
import svgPaths from "../imports/svg-ib8s7izy1q";

export function GenericWaitlistPage() {
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [stylistData, setStylistData] = useState<any>(null);
  const [stylistImages, setStylistImages] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useParams<{ username: string }>();

  useEffect(() => {
    // Get data from navigation state
    const intakeData = location.state as any;
    
    console.log('🔍 GenericWaitlistPage - Received state:', intakeData);
    
    // Now we expect uploadedImageUrl (string) and orderId from the saved order
    if (!intakeData || !intakeData.uploadedImageUrl || !intakeData.orderId) {
      console.warn('⚠️ No intake data found - redirecting to stylist profile');
      console.warn('Missing fields:', {
        hasState: !!intakeData,
        hasImageUrl: !!intakeData?.uploadedImageUrl,
        hasOrderId: !!intakeData?.orderId,
      });
      toast.error('Please complete the intake form first');
      if (username) {
        navigate(`/u/${username}`);
      } else {
        navigate('/');
      }
      return;
    }
    
    if (intakeData) {
      setStylistData({
        username: intakeData.stylistUsername,
        display_name: intakeData.stylistDisplayName,
        user_id: intakeData.stylistId,
      });
      
      // Use the uploaded image URL directly
      setUserImageUrl(intakeData.uploadedImageUrl);
      
      // Show the popup after image URL is set
      setTimeout(() => {
        setShowModal(true);
      }, 100);
    }
  }, [location.state, username, navigate]);

  useEffect(() => {
    // Fetch stylist's profile images to display on waitlist
    const fetchStylistImages = async () => {
      if (!username) return;

      try {
        console.log(`📸 Fetching ${username}'s profile images...`);
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/users/${username}`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          console.log('✅ Stylist profile data:', userData);
          
          // Get portfolio images from profile
          if (userData.portfolio_images && userData.portfolio_images.length > 0) {
            setStylistImages(userData.portfolio_images);
            console.log('✅ Loaded portfolio images:', userData.portfolio_images);
          } else if (userData.profile_image_url) {
            // Fallback to profile image if no portfolio
            setStylistImages([userData.profile_image_url]);
            console.log('✅ Using profile image as fallback');
          }
        }
      } catch (error) {
        console.error('❌ Error fetching stylist images:', error);
      }
    };

    fetchStylistImages();
  }, [username]);

  const handleJoinWaitlist = async () => {
    setIsSaving(true);

    try {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        toast.error('Please sign in to continue');
        navigate('/signin');
        return;
      }

      const intakeData = location.state as any;
      
      if (!intakeData || !intakeData.orderId) {
        toast.error('No order found. Please start over.');
        navigate(`/u/${username}`);
        return;
      }

      console.log('📝 Updating order status to waitlisted...');

      // Update order status to "waitlisted"
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/${intakeData.orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            status: 'waitlisted',
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
    } catch (error: any) {
      console.error('❌ Error joining waitlist:', error);
      toast.error(error.message || 'Failed to join waitlist. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoToInbox = () => {
    console.log('🚀 Navigating to customer inbox...');
    navigate('/customer-inbox');
  };

  return (
    <div 
      className="w-full min-h-screen bg-[#fffefd] flex flex-col overflow-x-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Header with back button */}
      <div 
        className="w-full px-6 pt-8 pb-6"
        style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => navigate(`/u/${username}`)}
          className="flex items-center gap-2 font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] uppercase cursor-pointer"
        >
          <span>←</span>
          <span>BACK</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-8">
        {/* Stacked Card Effect with Stylist's Portfolio Images */}
        {stylistImages.length > 0 && (
          <div className="relative w-full max-w-[361px] h-[360px] mb-8">
            {/* Back card - most faded */}
            <div className="absolute inset-[2.22%] border border-[#1e1709] rounded-[8px] opacity-80 bg-white" />
            
            {/* Middle card */}
            <div className="absolute inset-[4.43%_0_0_4.43%] border border-[#1e1709] rounded-[8px] bg-white" />
            
            {/* Front card with stylist's image */}
            <div className="absolute inset-[0_4.43%_4.43%_0] rounded-[8px] border border-[#1e1709] overflow-hidden">
              <img
                src={stylistImages[0]}
                alt={`${stylistData?.display_name || username}'s styling example`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Title */}
        <div className="w-full max-w-[361px] mb-2">
          <p className="font-['Helvetica_Neue:Bold',sans-serif] text-[14px] leading-[24px] tracking-[1px] uppercase text-[#1e1709]">
            CURATED EDIT → STYLE NOTES
          </p>
        </div>

        {/* Description */}
        <div className="w-full max-w-[361px] mb-16">
          <p className="font-['Helvetica_Neue:Light',sans-serif] text-[12px] leading-[24px] tracking-[1px] uppercase text-[#1e1709]">
            7 ITEM CAPSULE EDIT + STYLING NOTES CURATED BY {stylistData?.display_name || stylistData?.username || username}.
          </p>
        </div>

        {/* Price */}
        <div className="w-full max-w-[361px] mb-6">
          <p className="font-['Helvetica_Neue:Bold',sans-serif] text-[14px] leading-[24px] tracking-[1px] uppercase text-[#1e1709]">
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
                {stylistData?.display_name || stylistData?.username || username} will review your request and send you a personalized invitation soon.
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