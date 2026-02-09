import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  stylist_id: string;
  status: 'waitlist' | 'invited' | 'paid' | 'styling' | 'completed' | 'cancelled';
  main_image_url?: string;
  reference_images?: string[];
  intake_answers?: Record<string, string>;
  payment_status?: string;
  payment_amount?: number;
  created_at: string;
  invited_at?: string;
  paid_at?: string;
  styling_started_at?: string;
  completed_at?: string;
}

export function MessagesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>(''); // Add current user ID
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('user_email') || '';
    const userId = localStorage.getItem('user_id') || '';
    setUserEmail(email);
    fetchOrders();
  }, []);

  // Also refetch when window gains focus (user comes back to the tab)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window gained focus - refreshing stylist orders...');
      fetchOrders();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error('❌ No access token available');
        toast.error('Please sign in to view orders');
        navigate('/signin');
        return;
      }
      
      console.log('🔍 Fetching orders for current user as stylist...');
      
      // First, get the current user's ID from their profile
      const profileResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/profiles/me`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profileData = await profileResponse.json();
      const userId = profileData.profile?.auth_user_id || profileData.profile?.user_id;
      const username = profileData.profile?.username;
      
      if (!userId) {
        throw new Error('User ID not found in profile');
      }

      console.log('👤 Stylist auth_user_id:', userId);
      console.log('👤 Stylist username:', username);
      console.log('👤 Profile data:', profileData.profile);
      console.log('👤 Full profile object:', JSON.stringify(profileData, null, 2));
      
      // Fetch TWO types of orders:
      // 1. Orders where I'm the STYLIST (clients messaging me)
      // 2. Orders where I'm the CUSTOMER (me messaging stylists)
      
      const stylistIdForOrders = username || userId;
      console.log('📋 My User ID:', userId);
      console.log('📋 My Username:', username);
      
      // Fetch orders where I'm the stylist
      const stylistOrderUrl = `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/stylist/${stylistIdForOrders}`;
      console.log('📡 Fetching STYLIST orders from:', stylistOrderUrl);
      
      const stylistResponse = await fetch(
        stylistOrderUrl,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      let stylistOrders: any[] = [];
      if (stylistResponse.ok) {
        const data = await stylistResponse.json();
        stylistOrders = data.orders || [];
        console.log('✅ Fetched STYLIST orders:', stylistOrders.length);
      } else {
        console.error(' Failed to fetch stylist orders:', stylistResponse.status);
      }
      
      // Fetch orders where I'm the customer
      const customerOrderUrl = `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/customer/me`;
      console.log('📡 Fetching CUSTOMER orders from:', customerOrderUrl);
      
      const customerResponse = await fetch(
        customerOrderUrl,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      let customerOrders: any[] = [];
      if (customerResponse.ok) {
        const data = await customerResponse.json();
        customerOrders = data.orders || [];
        console.log('✅ Fetched CUSTOMER orders:', customerOrders.length);
      } else {
        console.error('❌ Failed to fetch customer orders:', customerResponse.status);
      }
      
      // Combine both lists (remove duplicates by ID)
      const allOrders = [...stylistOrders];
      customerOrders.forEach(order => {
        if (!allOrders.find(o => o.id === order.id)) {
          allOrders.push(order);
        } else {
          console.warn(`⚠️ DUPLICATE ORDER DETECTED: ${order.id} exists in both stylist and customer lists`);
          console.warn(`   Order stylist_id: ${order.stylist_id}`);
          console.warn(`   Current user username: ${username}`);
          console.warn(`   Current user ID: ${userId}`);
        }
      });
      
      console.log('📊 Total combined orders:', allOrders.length);
      console.log('📊 Breakdown: Stylist orders:', stylistOrders.length, '| Customer orders:', customerOrders.length);
      
      setOrders(allOrders);
      setCurrentUserId(userId); // Store current user ID for rendering logic
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      toast.error('Failed to load orders - check console for details');
    } finally {
      setLoading(false);
    }
  };

  // Group orders by status
  const waitlistOrders = orders.filter(o => o && o.status === 'waitlist');
  const invitedOrders = orders.filter(o => o && o.status === 'invited');
  const paidOrders = orders.filter(o => o && o.status === 'paid');
  const stylingOrders = orders.filter(o => o && o.status === 'styling');
  const completedOrders = orders.filter(o => o && o.status === 'completed');

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'waitlist':
        return (
          <button className="px-4 h-[36px] bg-[#1e1709] text-white rounded-[4px] font-['Helvetica_Neue:Bold',sans-serif] text-[11px] tracking-[0.5px] uppercase hover:bg-[#2a2010] transition-colors">
            + INVITE
          </button>
        );
      case 'invited':
        return (
          <div className="px-3 h-[28px] bg-[#1e1709]/10 rounded-[4px] font-['Helvetica_Neue:Regular',sans-serif] text-[10px] tracking-[0.5px] uppercase text-[#1e1709]/60 flex items-center justify-center">
            AWAITING PAYMENT
          </div>
        );
      case 'paid':
        return (
          <div className="px-3 h-[28px] bg-white border border-[#1e1709] rounded-[4px] font-['Helvetica_Neue:Bold',sans-serif] text-[11px] tracking-[0.5px] uppercase text-[#1e1709] flex items-center justify-center">
            READY
          </div>
        );
      case 'styling':
        return (
          <div className="px-3 h-[28px] bg-blue-500/10 border border-blue-500 rounded-[4px] font-['Helvetica_Neue:Regular',sans-serif] text-[10px] tracking-[0.5px] uppercase text-blue-700 flex items-center justify-center">
            STYLING...
          </div>
        );
      case 'completed':
        return (
          <div className="w-[28px] h-[28px] rounded-full bg-green-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const handleOrderClick = (orderId: string, status: Order['status']) => {
    // Navigate to order detail page
    navigate(`/message-detail/${orderId}`);
  };

  const renderOrderRow = (order: Order) => {
    // Determine if I'm the customer or stylist for this order
    const isCustomer = order.customer_id === currentUserId;
    const isStylist = !isCustomer; // If not customer, then I'm the stylist
    
    // Determine what name and image to show
    const displayName = isCustomer ? order.stylist_id : order.customer_name;
    const displayImage = order.main_image_url;
    
    // Custom click handler based on role and status
    const handleClick = () => {
      // If customer viewing waitlisted order, go directly to edit page
      if (isCustomer && order.status === 'waitlist') {
        navigate(`/lissy/intake/edit/${order.id}`);
      } else {
        // Otherwise, go to detail page
        navigate(`/message-detail/${order.id}`);
      }
    };
    
    // Determine what status badge to show
    const getCustomerStatusBadge = (status: Order['status']) => {
      switch (status) {
        case 'waitlist':
          return (
            <div className="px-3 h-[28px] bg-[#1e1709]/10 rounded-[4px] font-['Helvetica_Neue:Regular',sans-serif] text-[10px] tracking-[0.5px] uppercase text-[#1e1709]/60 flex items-center justify-center">
              WAITLISTED
            </div>
          );
        case 'invited':
          return (
            <div className="px-3 h-[28px] bg-[#1e1709] text-white rounded-[4px] font-['Helvetica_Neue:Bold',sans-serif] text-[11px] tracking-[0.5px] uppercase flex items-center justify-center">
              INVITED
            </div>
          );
        case 'paid':
        case 'styling':
          return (
            <div className="px-3 h-[28px] bg-blue-500/10 border border-blue-500 rounded-[4px] font-['Helvetica_Neue:Regular',sans-serif] text-[10px] tracking-[0.5px] uppercase text-blue-700 flex items-center justify-center">
              STYLING
            </div>
          );
        case 'completed':
          return (
            <div className="w-[28px] h-[28px] rounded-full bg-green-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          );
        default:
          return null;
      }
    };
    
    const getStylistStatusBadge = (status: Order['status']) => {
      switch (status) {
        case 'waitlist':
          return (
            <button className="px-4 h-[36px] bg-[#1e1709] text-white rounded-[4px] font-['Helvetica_Neue:Bold',sans-serif] text-[11px] tracking-[0.5px] uppercase hover:bg-[#2a2010] transition-colors">
              + INVITE
            </button>
          );
        case 'invited':
          return (
            <div className="px-3 h-[28px] bg-[#1e1709]/10 rounded-[4px] font-['Helvetica_Neue:Regular',sans-serif] text-[10px] tracking-[0.5px] uppercase text-[#1e1709]/60 flex items-center justify-center">
              AWAITING PAYMENT
            </div>
          );
        case 'paid':
          return (
            <div className="px-3 h-[28px] bg-white border border-[#1e1709] rounded-[4px] font-['Helvetica_Neue:Bold',sans-serif] text-[11px] tracking-[0.5px] uppercase text-[#1e1709] flex items-center justify-center">
              READY
            </div>
          );
        case 'styling':
          return (
            <div className="px-3 h-[28px] bg-blue-500/10 border border-blue-500 rounded-[4px] font-['Helvetica_Neue:Regular',sans-serif] text-[10px] tracking-[0.5px] uppercase text-blue-700 flex items-center justify-center">
              STYLING...
            </div>
          );
        case 'completed':
          return (
            <div className="w-[28px] h-[28px] rounded-full bg-green-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          );
        default:
          return null;
      }
    };
    
    return (
      <div key={order.id}>
        {/* Order Row */}
        <div 
          className="flex items-center gap-[18px] pl-[21px] pr-[27px] py-[18px] hover:bg-black/5 transition-colors cursor-pointer"
          onClick={handleClick}
        >
          {/* Photo */}
          <div className="flex-shrink-0">
            <div className="w-[60px] h-[60px] rounded-full border border-[#1e1709] overflow-hidden">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">
                  No Photo
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] leading-[24px] text-[#1e1709] tracking-[0.5px]">
              {displayName}
            </p>
            {/* Only show date if NOT a customer viewing a waitlisted order */}
            {!(isCustomer && order.status === 'waitlist') && (
              <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[10px] text-[#1e1709]/50 mt-[-2px]">
                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>

          {/* Status Badge - different based on role */}
          <div className="flex-shrink-0" onClick={(e) => {
            // Always navigate to detail page for all clicks on status badge
            e.stopPropagation();
            navigate(`/message-detail/${order.id}`);
          }}>
            {isCustomer ? getCustomerStatusBadge(order.status) : getStylistStatusBadge(order.status)}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-black/70" />
      </div>
    );
  };

  return (
    <div 
      className="relative w-full min-h-screen overflow-x-hidden bg-[#FFFEFD]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div 
        className="w-[393px] mx-auto relative"
        style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#FFFEFD] z-10 pt-5 pb-4 border-b border-[#1e1709]">
          <div className="flex items-center gap-3 pl-4">
            {/* Back button */}
            <button 
              onClick={() => navigate('/profile')}
              className="w-6 h-6 flex items-center justify-center flex-shrink-0"
            >
              <ArrowLeft className="w-6 h-6 text-[#1e1709]" strokeWidth={1.5} />
            </button>
            
            <h1 className="font-['Helvetica_Neue:Regular',sans-serif] text-[24px] tracking-[3px] text-[#1e1709] uppercase">
              Inbox
            </h1>
          </div>
        </div>

        {/* Orders List */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#1e1709] animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[11px] text-[#1e1709]/50 text-center tracking-[0.5px] uppercase">
                No styling requests yet
              </p>
            </div>
          ) : (
            <div>
              {/* WAITLIST Section */}
              {waitlistOrders.length > 0 && (
                <div>
                  <div className="bg-[#1e1709] px-[21px] py-3 border-b border-black/70">
                    <div className="flex items-center justify-between">
                      <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-white">
                        Requests
                      </p>
                      <div className="w-[24px] h-[24px] rounded-full bg-white flex items-center justify-center">
                        <span className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] text-[#1e1709]">
                          {waitlistOrders.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  {waitlistOrders.map(renderOrderRow)}
                </div>
              )}

              {/* PAID (READY TO STYLE) Section */}
              {paidOrders.length > 0 && (
                <div>
                  <div className="bg-white border-t border-b border-black/70 px-[21px] py-3">
                    <div className="flex items-center justify-between">
                      <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709]">
                        Ready to Style
                      </p>
                      <div className="w-[24px] h-[24px] rounded-full border border-[#1e1709] flex items-center justify-center">
                        <span className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] text-[#1e1709]">
                          {paidOrders.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  {paidOrders.map(renderOrderRow)}
                </div>
              )}

              {/* INVITED (AWAITING PAYMENT) Section */}
              {invitedOrders.length > 0 && (
                <div>
                  <div className="bg-white border-t border-b border-black/70 px-[21px] py-3">
                    <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709]/50">
                      Awaiting Payment
                    </p>
                  </div>
                  {invitedOrders.map(renderOrderRow)}
                </div>
              )}

              {/* STYLING (IN PROGRESS) Section */}
              {stylingOrders.length > 0 && (
                <div>
                  <div className="bg-white border-t border-b border-black/70 px-[21px] py-3">
                    <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709]/50">
                      In Progress
                    </p>
                  </div>
                  {stylingOrders.map(renderOrderRow)}
                </div>
              )}

              {/* COMPLETED Section */}
              {completedOrders.length > 0 && (
                <div>
                  <div className="bg-white border-t border-b border-black/70 px-[21px] py-3">
                    <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709]/50">
                      Completed
                    </p>
                  </div>
                  {completedOrders.map(renderOrderRow)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0">
        <BottomNavigation />
      </div>
    </div>
  );
}