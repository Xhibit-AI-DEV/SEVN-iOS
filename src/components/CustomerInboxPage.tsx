import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Loader2, Edit } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  stylist_id: string;
  status: 'intake_submitted' | 'waitlist' | 'invited' | 'paid' | 'styling' | 'completed' | 'cancelled';
  main_image_url?: string;
  reference_images?: string[];
  intake_answers?: any;
  payment_status?: string;
  payment_amount?: number;
  created_at: string;
  invited_at?: string;
  paid_at?: string;
  styling_started_at?: string;
  completed_at?: string;
}

export function CustomerInboxPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('Loading...');
  const navigate = useNavigate();

  // DEBUG FUNCTION
  const runDebugCheck = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      
      // Get "Who am I" info
      const whoAmIResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/debug/whoami`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const whoAmIData = await whoAmIResponse.json();
      
      console.log('🔑 ========== WHO AM I DEBUG ==========');
      console.log('🔑 Auth User ID:', whoAmIData.auth_user_id);
      console.log('🔑 Auth Email:', whoAmIData.auth_email);
      console.log('🔑 Profile Username:', whoAmIData.profile?.username);
      console.log('🔑 Customer Username:', whoAmIData.customer?.username);
      console.log('🔑 Order Index Key:', whoAmIData.order_index_key);
      console.log('🔑 Total Orders in Index:', whoAmIData.total_orders);
      console.log('🔑 Order IDs:', whoAmIData.order_ids);
      console.log('🔑 LocalStorage user_id:', localStorage.getItem('user_id'));
      console.log('🔑 ====================================');
      
      setDebugInfo(`Debug Complete! Check console.\n\nAuth User ID: ${whoAmIData.auth_user_id}\nUsername: ${whoAmIData.profile?.username || 'N/A'}\nOrders Found: ${whoAmIData.total_orders}\n\nLocalStorage user_id: ${localStorage.getItem('user_id')}\n\n${whoAmIData.auth_user_id !== localStorage.getItem('user_id') ? '⚠️ MISMATCH DETECTED!' : '✅ IDs Match'}`);
    } catch (error) {
      console.error(' Debug error:', error);
      setDebugInfo('Debug failed! Check console for errors.');
    }
  };

  const fetchOrders = async () => {
    try {
      console.log('🔄 ========== FETCH ORDERS CALLED ==========');
      console.log('🔄 Timestamp:', new Date().toISOString());
      console.log('🔄 Current orders state length:', orders.length);
      console.log('🔄 Current loading state:', loading);
      setLoading(true);
      
      // Get auth tokens
      const authToken = localStorage.getItem('auth_token');
      const accessToken = localStorage.getItem('access_token');
      const storedUserId = localStorage.getItem('user_id');
      
      console.log('🔍 ========== LOCAL STORAGE CHECK ==========');
      console.log('🔍 auth_token exists:', !!authToken);
      console.log('🔍 access_token exists:', !!accessToken);
      console.log('🔍 user_id exists:', !!storedUserId);
      console.log('🔍 user_id value:', storedUserId);
      
      if (!authToken || !accessToken) {
        console.error('❌ No auth tokens found in localStorage');
        toast.error('Please sign in to view your requests');
        navigate('/signin');
        return;
      }

      console.log('🔍 ========== FETCHING CUSTOMER ORDERS ==========');
      console.log('🔍 Stored user ID:', storedUserId);
      console.log('🔍 Auth token (first 20 chars):', authToken.substring(0, 20));
      console.log('🔍 Access token (first 20 chars):', accessToken.substring(0, 20));
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/customer/me`;
      console.log('🔍 Fetching from URL:', url);
      
      // The endpoint will use the access_token to get the REAL user ID from Supabase Auth
      // We pass "me" as a placeholder - the backend will use the authenticated user's ID
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,  // Use access_token, not auth_token
        },
      });

      console.log('📡 ========== RESPONSE RECEIVED ==========');
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ ========== RAW RESPONSE DATA ==========');
        console.log('✅ Full response:', JSON.stringify(data, null, 2));
        console.log('✅ data.orders exists:', !!data.orders);
        console.log('✅ Number of orders:', data.orders?.length || 0);
        
        if (data.orders && data.orders.length > 0) {
          console.log('✅ ========== ORDERS DETAILS ==========');
          data.orders.forEach((order: any, index: number) => {
            console.log(`✅ Order ${index + 1}:`, {
              id: order.id,
              status: order.status,
              customer_id: order.customer_id,
              created_at: order.created_at,
              hasMainImage: !!order.main_image_url,
            });
          });
          console.log('✅ Setting orders state with', data.orders.length, 'orders');
          console.log('✅ Orders array:', data.orders);
        } else {
          console.log('⚠️ ========== NO ORDERS FOUND ==========');
          console.log('⚠️ No orders found for authenticated user');
          console.log('⚠️ This could mean:');
          console.log('   1. You haven\'t submitted any styling requests yet');
          console.log('   2. There\'s an issue with order creation');
          console.log('   3. The customer_orders index is missing');
          console.log('💡 Try going to /chris to submit a styling request');
        }
        
        console.log('🔄 About to call setOrders with:', data.orders || []);
        setOrders(data.orders || []);
        console.log('✅ setOrders called');
        
        // Set the real user ID from the first order if available
        if (data.orders && data.orders.length > 0 && data.orders[0].customer_id) {
          console.log('✅ Setting userId state to:', data.orders[0].customer_id);
          setUserId(data.orders[0].customer_id);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ ========== FETCH FAILED ==========');
        console.error('❌ Failed to fetch orders. Status:', response.status);
        console.error('❌ Error response:', errorText);
        toast.error(`Failed to load requests (${response.status})`);
        // Don't clear orders on error - keep showing what we had
      }
      console.log('📝 ========== FETCH COMPLETE ==========');
    } catch (error) {
      console.error('❌ ========== ERROR CAUGHT ==========');
      console.error('❌ Error fetching orders:', error);
      console.error('❌ Error stack:', (error as Error).stack);
      toast.error('Failed to load requests');
      // Don't clear orders on error - keep showing what we had
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
      console.log('🏁 ========== FETCH ORDERS DONE ==========');
    }
  };

  useEffect(() => {
    console.log('🔄 CustomerInboxPage mounted - fetching orders...');
    
    // Automatic debug on mount
    const accessToken = localStorage.getItem('access_token');
    const authToken = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    
    console.log('🔍 ========== AUTO DEBUG ON MOUNT ==========');
    console.log('🔍 Has access_token:', !!accessToken);
    console.log('🔍 Has auth_token:', !!authToken);
    console.log('🔍 Has user_id:', !!userId);
    console.log('🔍 user_id value:', userId);
    console.log('🔍 ==========================================');
    
    fetchOrders();
  }, []); // Fetch orders when component mounts

  // Also refetch when window gains focus (user comes back to the tab)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window gained focus - refreshing orders...');
      fetchOrders();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchOrders]); // Add fetchOrders to dependencies

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'intake_submitted':
        return 'Intake Submitted';
      case 'waitlist':
        return 'Waitlisted';
      case 'invited':
        return 'Payment Required';
      case 'paid':
        return 'Being Styled';
      case 'styling':
        return 'Styling in Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'intake_submitted':
        return (
          <div className="w-[96px] h-[28px] bg-[#E6E6E3] rounded-[6px] font-['Helvetica_Neue:Regular',sans-serif] text-[10px] tracking-[1px] uppercase text-[#8F8F8C] flex items-center justify-center">
            Intake Submitted
          </div>
        );
      case 'waitlist':
        return (
          <div className="w-[96px] h-[28px] bg-[#E6E6E3] rounded-[6px] font-['Helvetica_Neue:Regular',sans-serif] text-[10px] tracking-[1px] uppercase text-[#8F8F8C] flex items-center justify-center">
            Waitlisted
          </div>
        );
      case 'invited':
        return (
          <button className="px-6 h-[40px] bg-[#1e1709] text-white rounded-[8px] font-['Helvetica_Neue:Medium',sans-serif] text-[11px] tracking-[1.5px] uppercase hover:bg-[#2a2010] transition-colors">
            PAY NOW
          </button>
        );
      case 'paid':
        return (
          <div className="w-[96px] h-[28px] bg-[#E6E6E3] rounded-[6px] font-['Helvetica_Neue:Regular',sans-serif] text-[10px] tracking-[1px] uppercase text-[#8F8F8C] flex items-center justify-center">
            STYLING
          </div>
        );
      case 'styling':
        return (
          <div className="w-[96px] h-[28px] bg-[#E6E6E3] rounded-[6px] font-['Helvetica_Neue:Regular',sans-serif] text-[10px] tracking-[1px] uppercase text-[#8F8F8C] flex items-center justify-center">
            STYLING
          </div>
        );
      case 'completed':
        return (
          <div className="w-[40px] h-[40px] rounded-full bg-[#1e1709] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const handleOrderClick = (order: Order) => {
    // Route to appropriate intake edit form based on stylist
    if (order.stylist_id === 'lissy_roddy' || order.stylist_id === 'dovheichemer' || order.stylist_id === 'lissy') {
      // Lissy's order - check if there's a Lissy edit route, otherwise use generic
      navigate(`/lissy/intake/edit/${order.id}`);
    } else if (order.stylist_id === 'chriswhly') {
      // Chris's order
      navigate(`/chris/intake/edit/${order.id}`);
    } else {
      // Generic intake edit
      navigate(`/intake/edit/${order.id}`);
    }
  };

  const handleEditClick = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    // Navigate to edit mode of intake form based on stylist
    if (order.stylist_id === 'lissy_roddy' || order.stylist_id === 'dovheichemer' || order.stylist_id === 'lissy') {
      navigate(`/lissy/intake/edit/${order.id}`);
    } else if (order.stylist_id === 'chriswhly') {
      navigate(`/chris/intake/edit/${order.id}`);
    } else {
      navigate(`/intake/edit/${order.id}`);
    }
  };

  const renderOrderRow = (order: Order) => {
    // Format stylist name for display
    const getStylistDisplayName = (stylistId: string) => {
      return stylistId.toUpperCase();
    };
    
    return (
      <div key={order.id}>
        {/* Order Row */}
        <div 
          className="flex items-center gap-[18px] px-[27px] py-[16px] hover:bg-black/5 transition-colors cursor-pointer relative"
          onClick={() => handleOrderClick(order)}
        >
          {/* Main Photo */}
          <div className="flex-shrink-0">
            <div className="w-[60px] h-[60px] rounded-full border border-[#1e1709] overflow-hidden">
              {order.main_image_url ? (
                <img
                  src={order.main_image_url}
                  alt="Style request"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">
                  No Photo
                </div>
              )}
            </div>
          </div>

          {/* Stylist Name */}
          <div className="flex-1 min-w-0">
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] leading-[24px] text-[#1e1709] tracking-[0.5px]">
              {getStylistDisplayName(order.stylist_id)}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0" onClick={(e) => {
            if (order.status === 'invited') {
              e.stopPropagation();
              navigate(`/order/${order.id}`);
            }
          }}>
            {getStatusBadge(order.status)}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-black" />
      </div>
    );
  };

  // Group orders by status
  const waitlistOrders = orders.filter(o => o.status === 'waitlist');
  const invitedOrders = orders.filter(o => o.status === 'invited');
  const activeOrders = orders.filter(o => ['paid', 'styling'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'completed');

  // Add debugging
  console.log('📊 ORDER BREAKDOWN:');
  console.log('📊 Total orders:', orders.length);
  console.log('📊 Waitlist:', waitlistOrders.length, waitlistOrders);
  console.log('📊 Invited:', invitedOrders.length, invitedOrders);
  console.log('📊 Active:', activeOrders.length, activeOrders);
  console.log('📊 Completed:', completedOrders.length, completedOrders);
  console.log('📊 All orders:', orders);

  return (
    <div 
      className="w-full h-screen bg-[#FFFEFD] flex flex-col overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Header */}
      <div className="bg-[#FFFEFD] w-full shrink-0 flex items-center gap-3 pl-4 h-[48px] border-b border-black/70">
        {/* Back button */}
        <button 
          onClick={() => navigate('/home')}
          className="w-6 h-6 flex items-center justify-center flex-shrink-0"
        >
          <ArrowLeft className="w-6 h-6 text-[#1e1709]" strokeWidth={1.5} />
        </button>
        
        <h1 className="font-['Helvetica_Neue:Regular',sans-serif] text-[24px] tracking-[3px] text-[#1e1709] uppercase flex-1">
          Inbox
        </h1>
      </div>

      {/* Scrollable content - flex-1 makes it take remaining space */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24" style={{ WebkitOverflowScrolling: 'touch', minHeight: 0 }}>
        {/* Orders List */}
        <div className="w-[393px] mx-auto">
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
              {/* REQUESTS Section - Combined all non-completed orders */}
              {(waitlistOrders.length > 0 || invitedOrders.length > 0 || activeOrders.length > 0) && (
                <div>
                  <div className="bg-[#1e1709] px-[21px] py-3 border-b border-black/70">
                    <div className="flex items-center justify-between">
                      <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-white">
                        Requests
                      </p>
                      <div className="w-[24px] h-[24px] rounded-full bg-white flex items-center justify-center">
                        <span className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] text-[#1e1709]">
                          {waitlistOrders.length + invitedOrders.length + activeOrders.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Payment Required Orders First */}
                  {invitedOrders.map(renderOrderRow)}
                  {/* Waitlisted Orders */}
                  {waitlistOrders.map(renderOrderRow)}
                  {/* Active/Styling Orders */}
                  {activeOrders.map(renderOrderRow)}
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