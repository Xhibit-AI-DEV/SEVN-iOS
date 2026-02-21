import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, X } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import svgPaths from "../imports/svg-ib8s7izy1q";
import img021 from "figma:asset/e72a0bbadee5488647fef8721e8949abb9815c1d.png"; // Lissy's correct featured edit image from landing page
import img22 from "figma:asset/9f1f3c2c66a18611ca3dc256be40c92f256300b5.png";
import img23 from "figma:asset/dee233baf3a56cb7abc1b3ff6012d7e6797aeecf.png";

export function WaitlistPage() {
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [stylistId, setStylistId] = useState<string | null>(null);
  const navigate = useNavigate();
  const hasProcessedState = useState(false);

  useEffect(() => {
    // Only process state once to avoid double-render issues
    if (hasProcessedState[0]) {
      console.log('🔍 WaitlistPage - Already processed state, skipping');
      return;
    }

    const loadIntakeData = async () => {
      console.log('🔄 WaitlistPage: Loading intake data...');
      
      // Try localStorage
      const stored = localStorage.getItem('pendingIntakeData');
      if (stored) {
        const intakeData = JSON.parse(stored);
        console.log('📦 Loaded from localStorage:', intakeData);
        
        // Mark as processed
        hasProcessedState[1](true);
        
        // Store the data
        setUserImageUrl(intakeData.uploadedImageUrl);
        setOrderId(intakeData.orderId);
        setStylistId(intakeData.stylistId || 'lissy_roddy');
        
        // Clear localStorage since we've successfully loaded it
        localStorage.removeItem('pendingIntakeData');
        
        console.log('✅ Waitlist page initialized with order:', intakeData.orderId);
        return;
      }
      
      // If still no data, try to fetch user's most recent order from backend
      const accessToken = localStorage.getItem('access_token');
      console.log('   access_token exists:', !!accessToken);
      
      if (accessToken) {
        try {
          console.log('📤 Fetching from: /orders/my-orders');
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/my-orders`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          
          console.log('📥 Response status:', response.status, response.statusText);
          
          if (response.ok) {
            const orders = await response.json();
            console.log('📦 Fetched orders:', orders);
            console.log('📦 Number of orders:', Array.isArray(orders) ? orders.length : 'not an array');
            
            // Find the most recent Lissy order
            const lissyOrders = orders.filter((o: any) => 
              o.stylist_id === 'lissy_roddy' && 
              (o.status === 'intake_submitted' || o.status === 'waitlist')
            );
            
            console.log('📦 Lissy orders found:', lissyOrders.length);
            if (lissyOrders.length > 0) {
              console.log('📦 Most recent Lissy order:', lissyOrders[0]);
            }
            
            if (lissyOrders.length > 0) {
              const mostRecentOrder = lissyOrders[0];
              const intakeData = {
                orderId: mostRecentOrder.id,
                uploadedImageUrl: mostRecentOrder.main_image_url,
                stylistId: mostRecentOrder.stylist_id,
              };
              console.log('✅ Restored order from backend:', intakeData);
              
              // Mark as processed
              hasProcessedState[1](true);
              
              // Store the data
              setUserImageUrl(intakeData.uploadedImageUrl);
              setOrderId(intakeData.orderId);
              setStylistId(intakeData.stylistId || 'lissy_roddy');
              
              console.log('✅ Waitlist page initialized with order:', intakeData.orderId);
            }
          } else {
            const errorText = await response.text();
            console.error('❌ Backend error:', errorText);
          }
        } catch (error) {
          console.error('❌ Failed to fetch orders:', error);
        }
      }
      
      // If we still don't have data, redirect back
      if (!userImageUrl || !orderId) {
        console.log('⚠️ No intake data found, redirecting to /lissy');
        toast.error('Please complete the intake form first');
        
        // Redirect after a brief delay so user sees the toast
        setTimeout(() => {
          navigate('/lissy', { replace: true });
        }, 1500);
        return;
      }
    };
    
    loadIntakeData();
    
    // DO NOT auto-show modal - only show after user clicks JOIN WAITLIST
  }, [navigate]); // Add location.state to dependencies

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
        navigate('/lissy');
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
      
      // Show success modal
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
          onClick={() => navigate('/lissy')}
          className="flex items-center gap-2 font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] uppercase cursor-pointer"
        >
          <span>←</span>
          <span>BACK</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-8">
        {/* Lissy's Featured Edit Image from Landing Page - Stacked Card Effect */}
        <div className="relative w-full max-w-[270px] h-[360px] mb-8">
          {/* Back card - bottom right offset */}
          <div className="absolute top-[8px] left-[8px] right-0 bottom-0 border border-[#1e1709] rounded-[12px] bg-white" />
          
          {/* Middle card */}
          <div className="absolute top-[4px] left-[4px] right-[4px] bottom-[4px] border border-[#1e1709] rounded-[12px] bg-white" />
          
          {/* Front card with Lissy's featured edit image */}
          <div className="absolute top-0 left-0 right-[8px] bottom-[8px] rounded-[12px] border border-[#1e1709] overflow-hidden">
            <img
              src={img021}
              alt="Lissy's featured edit"
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
            7 ITEM CAPSULE EDIT + STYLING NOTES CURATED BY LISSY RODDY.
          </p>
        </div>

        {/* Price */}
        <div className="w-full max-w-[361px] mb-6">
          <p className="font-['Helvetica_Neue:Bold',sans-serif] text-[14px] leading-[24px] tracking-[1px] text-[#1e1709]">
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
            {/* User's uploaded image with stacked card effect - ALWAYS show */}
            <div className="relative w-full max-w-[361px] h-[360px] mb-8">
              {/* Back card - bottom right offset */}
              <div className="absolute top-[8px] left-[8px] right-0 bottom-0 border border-[#1e1709] rounded-[12px] bg-white" />
              
              {/* Middle card */}
              <div className="absolute top-[4px] left-[4px] right-[4px] bottom-[4px] border border-[#1e1709] rounded-[12px] bg-white" />
              
              {/* Front card with user's actual uploaded image */}
              <div className="absolute top-0 left-0 right-[8px] bottom-[8px] rounded-[12px] border border-[#1e1709] overflow-hidden">
                <img
                  src={userImageUrl || ''}
                  alt="Your style"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Success message */}
            <div className="w-full max-w-[361px] mb-16 text-center">
              <p className="font-['Helvetica_Neue:Bold',sans-serif] text-[18px] leading-[24px] tracking-[2px] uppercase text-[#1e1709] mb-3">
                YOU'RE ON THE LIST
              </p>
              <p className="font-['Helvetica_Neue:Light',sans-serif] text-[12px] leading-[20px] tracking-[0.5px] text-[#1e1709]">
                When Lissy's waitlist opens you will get an invite.
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