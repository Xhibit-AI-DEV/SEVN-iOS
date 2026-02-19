import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [settingRole, setSettingRole] = useState(false);
  const [invitingOrderId, setInvitingOrderId] = useState<string | null>(null); // Track which order is being invited
  const navigate = useNavigate();

  useEffect(() => {
    const loadStylistData = async () => {
      console.log('🔄 Loading stylist data...');
      setLoading(true);

      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          console.log('❌ No access token found');
          navigate('/signin');
          return;
        }

        console.log('✅ Access token found');
        
        // Validate token first before making other API calls
        console.log('🔐 Validating access token...');
        let validateResponse;
        try {
          validateResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/auth/validate-token`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
        } catch (validateError: any) {
          console.error('❌ Network error validating token:', validateError);
          toast.error('Network error. Please check your connection.');
          setLoading(false);
          return;
        }

        if (!validateResponse.ok) {
          const errorData = await validateResponse.json();
          console.error('❌ Token validation failed:', errorData);
          console.error('❌ Clearing expired token and redirecting to signin');
          localStorage.clear();
          toast.error('Session expired. Please sign in again.');
          setTimeout(() => navigate('/signin'), 100);
          return;
        }

        console.log('✅ Token is valid');

        // Fetch user profile
        console.log('👤 Fetching current user profile...');
        let profileResponse;
        try {
          profileResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/profiles/me`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
        } catch (fetchError: any) {
          console.error('❌ Network error fetching profile:', fetchError);
          console.error('❌ Error details:', {
            name: fetchError.name,
            message: fetchError.message,
            stack: fetchError.stack,
          });
          toast.error('Network error. Please check your connection.');
          setLoading(false);
          return;
        }

        if (!profileResponse.ok) {
          const errorText = await profileResponse.text();
          console.error('❌ Profile fetch failed:', profileResponse.status, errorText);
          
          // If auth error, clear token and redirect to signin
          if (profileResponse.status === 401 || profileResponse.status === 403) {
            console.error('❌ Authentication failed - clearing token and redirecting to signin');
            localStorage.clear(); // Clear all localStorage to reset state
            toast.error('Session expired. Please sign in again.');
            setTimeout(() => navigate('/signin'), 100);
            return;
          }
          
          throw new Error(`Failed to fetch user profile: ${profileResponse.status} - ${errorText}`);
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
        
        // Get email from localStorage (set before this function is called)
        const currentUserEmail = localStorage.getItem('user_email') || '';
        
        // Map stylist email to stylist ID used in orders
        const stylistEmailToId: Record<string, string> = {
          'lewis@sevn.app': 'lewis_bloyce',
          'lissy@sevn.app': 'lissy_roddy',
          'chris@sevn.app': 'chris_whly',
          'dovheichemer@gmail.com': 'lissy_roddy', // Legacy mapping
        };
        
        const stylistIdForOrders = stylistEmailToId[currentUserEmail.toLowerCase()] || username || userId;
        console.log('📋 ====== STYLIST ID MAPPING ======');
        console.log('📋 My User ID (auth_user_id):', userId);
        console.log('📋 My Username:', username);
        console.log('📋 My Email (from localStorage):', currentUserEmail);
        console.log('📋 Email lowercase:', currentUserEmail.toLowerCase());
        console.log('📋 Mapped stylist ID from email:', stylistEmailToId[currentUserEmail.toLowerCase()]);
        console.log('📋 Final stylist ID for orders:', stylistIdForOrders);
        console.log('📋 ================================');
        
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
          console.log('✅ Fetched STYLIST orders (CLIENT REQUESTS):', stylistOrders.length);
          stylistOrders.forEach((order, idx) => {
            console.log(`  ${idx + 1}. Order ${order.id}: customer=${order.customer_name}, status=${order.status}`);
          });
        } else {
          console.error('❌ Failed to fetch stylist orders:', stylistResponse.status);
        }
        
        // Fetch orders where I'm the customer (my own styling requests)
        const customerOrderUrl = `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/my-orders`;
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
          customerOrders = await customerResponse.json();  // my-orders returns array directly, not wrapped in {orders: []}
          console.log('✅ Fetched CUSTOMER orders (STYLING REQUESTS):', customerOrders.length);
          customerOrders.forEach((order, idx) => {
            console.log(`  ${idx + 1}. Order ${order.id}: stylist=${order.stylist_id}, status=${order.status}`);
          });
        } else {
          console.error('❌ Failed to fetch customer orders:', customerResponse.status);
        }
        
        // Tag orders with their role before combining
        const taggedStylistOrders = stylistOrders.map(order => ({ ...order, _myRole: 'stylist' }));
        const taggedCustomerOrders = customerOrders.map(order => ({ ...order, _myRole: 'customer' }));
        
        // Combine both lists (remove duplicates by ID, keeping role tags)
        const allOrders = [...taggedStylistOrders];
        taggedCustomerOrders.forEach(order => {
          const existingOrder = allOrders.find(o => o.id === order.id);
          if (!existingOrder) {
            allOrders.push(order);
          } else {
            // Order exists in both lists - tag it with BOTH roles
            console.log(`📋 Order ${order.id} appears in both lists (you're both customer AND stylist)`);
            existingOrder._myRole = 'both';
          }
        });
        
        console.log('📊 Total combined orders:', allOrders.length);
        console.log('📊 Breakdown: Client requests:', stylistOrders.length, '| Styling requests:', customerOrders.length);
        
        setOrders(allOrders);
        setCurrentUserId(userId); // Store current user ID for rendering logic
      } catch (error) {
        console.error('❌ Error fetching orders:', error);
        console.error('❌ Error details:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        
        // Provide more specific error message
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          toast.error('Network error - please check your connection and try again');
        } else {
          toast.error('Failed to load orders - check console for details');
        }
      } finally {
        setLoading(false);
      }
    };

    const email = localStorage.getItem('user_email') || '';
    const userId = localStorage.getItem('user_id') || '';
    setUserEmail(email);
    loadStylistData();
  }, []);

  // Refetch orders when navigating back to this page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible - refreshing orders...');
        fetchOrders();
      }
    };

    const handleFocus = () => {
      console.log('🔄 Window gained focus - refreshing orders...');
      fetchOrders();
    };

    // Listen for both visibility change and focus
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
      
      // Always read email fresh from localStorage (not from state)
      const currentUserEmail = localStorage.getItem('user_email') || '';
      
      console.log('🔍 Fetching orders for current user as stylist...');
      console.log('🔍 Current user email (from localStorage):', currentUserEmail);
      
      // First, get the current user's ID from their profile
      let profileResponse;
      try {
        profileResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/profiles/me`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
      } catch (fetchError: any) {
        console.error('❌ Network error fetching profile:', fetchError);
        console.error('❌ Error details:', {
          name: fetchError.name,
          message: fetchError.message,
          stack: fetchError.stack,
        });
        toast.error('Network error. Please check your connection.');
        setLoading(false);
        return;
      }

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('❌ Profile fetch failed:', profileResponse.status, errorText);
        
        // If auth error, clear token and redirect to signin
        if (profileResponse.status === 401 || profileResponse.status === 403) {
          console.error('❌ Authentication failed - clearing token and redirecting to signin');
          localStorage.clear(); // Clear all localStorage to reset state
          toast.error('Session expired. Please sign in again.');
          setTimeout(() => navigate('/signin'), 100);
          return;
        }
        
        throw new Error(`Failed to fetch user profile: ${profileResponse.status} - ${errorText}`);
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
      
      // Get email from localStorage (set before this function is called)
      const emailFromStorage = localStorage.getItem('user_email') || '';
      
      // Map stylist email to stylist ID used in orders
      const stylistEmailToId: Record<string, string> = {
        'lewis@sevn.app': 'lewis_bloyce',
        'lissy@sevn.app': 'lissy_roddy',
        'chris@sevn.app': 'chris_whly',
        'dovheichemer@gmail.com': 'lissy_roddy', // Legacy mapping
      };
      
      const stylistIdForOrders = stylistEmailToId[emailFromStorage.toLowerCase()] || username || userId;
      console.log('📋 ====== STYLIST ID MAPPING ======');
      console.log('📋 My User ID (auth_user_id):', userId);
      console.log('📋 My Username:', username);
      console.log('📋 My Email (from localStorage):', emailFromStorage);
      console.log('📋 Email lowercase:', emailFromStorage.toLowerCase());
      console.log('📋 Mapped stylist ID from email:', stylistEmailToId[emailFromStorage.toLowerCase()]);
      console.log('📋 Final stylist ID for orders:', stylistIdForOrders);
      console.log('📋 ================================');
      
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
        console.log('✅ Fetched STYLIST orders (CLIENT REQUESTS):', stylistOrders.length);
        stylistOrders.forEach((order, idx) => {
          console.log(`  ${idx + 1}. Order ${order.id}: customer=${order.customer_name}, status=${order.status}`);
        });
      } else {
        console.error('❌ Failed to fetch stylist orders:', stylistResponse.status);
      }
      
      // Fetch orders where I'm the customer (my own styling requests)
      const customerOrderUrl = `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/my-orders`;
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
        customerOrders = await customerResponse.json();  // my-orders returns array directly, not wrapped in {orders: []}
        console.log('✅ Fetched CUSTOMER orders (STYLING REQUESTS):', customerOrders.length);
        customerOrders.forEach((order, idx) => {
          console.log(`  ${idx + 1}. Order ${order.id}: stylist=${order.stylist_id}, status=${order.status}`);
        });
      } else {
        console.error('❌ Failed to fetch customer orders:', customerResponse.status);
      }
      
      // Tag orders with their role before combining
      const taggedStylistOrders = stylistOrders.map(order => ({ ...order, _myRole: 'stylist' }));
      const taggedCustomerOrders = customerOrders.map(order => ({ ...order, _myRole: 'customer' }));
      
      // Combine both lists (remove duplicates by ID, keeping role tags)
      const allOrders = [...taggedStylistOrders];
      taggedCustomerOrders.forEach(order => {
        const existingOrder = allOrders.find(o => o.id === order.id);
        if (!existingOrder) {
          allOrders.push(order);
        } else {
          // Order exists in both lists - tag it with BOTH roles
          console.log(`📋 Order ${order.id} appears in both lists (you're both customer AND stylist)`);
          existingOrder._myRole = 'both';
        }
      });
      
      console.log('📊 Total combined orders:', allOrders.length);
      console.log('📊 Breakdown: Client requests:', stylistOrders.length, '| Styling requests:', customerOrders.length);
      
      setOrders(allOrders);
      setCurrentUserId(userId); // Store current user ID for rendering logic
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      // Provide more specific error message
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error('Network error - please check your connection and try again');
      } else {
        toast.error('Failed to load orders - check console for details');
      }
    } finally {
      setLoading(false);
    }
  };

  // Group orders by TWO dimensions: role (client vs stylist) AND status
  console.log('🔍 Grouping orders by role and status');
  console.log('🔍 Total orders:', orders.length);
  console.log('🔍 Current user ID:', currentUserId);
  
  // Separate into CLIENT REQUESTS (I'm the stylist) and STYLING REQUESTS (I'm the customer)
  // Use the _myRole tag that was added during fetch
  const clientRequests = orders.filter(o => o && (o._myRole === 'stylist' || o._myRole === 'both'));
  const stylingRequests = orders.filter(o => o && (o._myRole === 'customer' || o._myRole === 'both'));
  
  console.log('📊 CLIENT REQUESTS (where I\'m the stylist):', clientRequests.length);
  clientRequests.forEach(o => {
    console.log(`  - ${o.customer_name} | ${o.status} | role=${o._myRole}`);
  });
  
  console.log('📊 STYLING REQUESTS (where I\'m the customer):', stylingRequests.length);
  stylingRequests.forEach(o => {
    console.log(`  - ${o.stylist_id} | ${o.status} | role=${o._myRole}`);
  });
  
  // Group CLIENT REQUESTS by status
  const clientWaitlistOrders = clientRequests.filter(o => o.status === 'waitlist');
  const clientInvitedOrders = clientRequests.filter(o => o.status === 'invited');
  const clientPaidOrders = clientRequests.filter(o => o.status === 'paid');
  const clientStylingOrders = clientRequests.filter(o => o.status === 'styling');
  const clientCompletedOrders = clientRequests.filter(o => o.status === 'completed');
  
  // Group STYLING REQUESTS by status
  const stylingWaitlistOrders = stylingRequests.filter(o => o.status === 'waitlist');
  const stylingInvitedOrders = stylingRequests.filter(o => o.status === 'invited');
  const stylingPaidOrders = stylingRequests.filter(o => o.status === 'paid');
  const stylingStylingOrders = stylingRequests.filter(o => o.status === 'styling');
  const stylingCompletedOrders = stylingRequests.filter(o => o.status === 'completed');

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
            INVITED
          </div>
        );
      case 'paid':
      case 'styling':
        return (
          <div className="px-3 h-[28px] bg-[#1e1709]/10 rounded-[4px] font-['Helvetica_Neue:Regular',sans-serif] text-[10px] tracking-[0.5px] uppercase text-[#1e1709]/60 flex items-center justify-center">
            READY TO BE STYLED
          </div>
        );
      case 'completed':
        // Don't show badge for completed orders (customers)
        return null;
      default:
        return null;
    }
  };

  const handleOrderClick = (orderId: string, status: Order['status']) => {
    // Navigate to order detail page
    navigate(`/message-detail/${orderId}`);
  };

  const handleInvite = async (orderId: string, customerName: string) => {
    try {
      setInvitingOrderId(orderId);
      
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        toast.error('Please sign in to send invite');
        return;
      }
      
      console.log('💌 Sending invite for order:', orderId);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/${orderId}/invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Invite sent:', data);
        toast.success(`Invite sent to ${customerName}!`);
        
        // Refresh orders to show updated status
        await fetchOrders();
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to send invite:', errorText);
        toast.error('Failed to send invite');
      }
    } catch (error) {
      console.error('❌ Error sending invite:', error);
      toast.error('Failed to send invite');
    } finally {
      setInvitingOrderId(null);
    }
  };

  const renderOrderRow = (order: Order) => {
    // Determine if I'm the customer or stylist for this order
    const isCustomer = order.customer_id === currentUserId;
    const isStylist = !isCustomer; // If not customer, then I'm the stylist
    
    // Helper function to format stylist name
    const formatStylistName = (stylistId: string) => {
      return stylistId
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };
    
    // Determine what name and image to show
    let displayName;
    if (isCustomer && order.status === 'completed') {
      // For completed orders, show "YOUR SELECTS BY STYLIST NAME"
      displayName = `YOUR SELECTS BY ${formatStylistName(order.stylist_id).toUpperCase()}`;
    } else if (isCustomer) {
      displayName = formatStylistName(order.stylist_id);
    } else {
      displayName = order.customer_name;
    }
    
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
            <div className="px-3 h-[28px] bg-[#1e1709]/10 rounded-[4px] font-['Helvetica_Neue:Regular',sans-serif] text-[10px] tracking-[0.5px] uppercase text-[#1e1709]/60 flex items-center justify-center">
              READY TO BE STYLED
            </div>
          );
        case 'completed':
          // Don't show badge for completed orders (customers)
          return null;
        default:
          return null;
      }
    };
    
    const getStylistStatusBadge = (status: Order['status']) => {
      switch (status) {
        case 'waitlist':
          return (
            <button 
              className="px-4 h-[36px] bg-[#1e1709] text-white rounded-[4px] font-['Helvetica_Neue:Bold',sans-serif] text-[11px] tracking-[0.5px] uppercase hover:bg-[#2a2010] transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={invitingOrderId === order.id}
              onClick={(e) => {
                e.stopPropagation(); // Don't navigate to detail page
                handleInvite(order.id, order.customer_name);
              }}
            >
              {invitingOrderId === order.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                '+ INVITE'
              )}
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
            // Only navigate to detail page if NOT clicking the invite button for stylist waitlist orders
            if (isStylist && order.status === 'waitlist') {
              // Don't do anything - let the button handle it
              return;
            }
            // For all other cases, navigate to detail page
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
              {/* ==================== CLIENT REQUESTS SECTION ==================== */}
              {clientRequests.length > 0 && (
                <div className="mb-8">
                  {/* Section Header */}
                  <div className="bg-[#1e1709] px-[21px] py-4 border-b border-black">
                    <h2 className="font-['Helvetica_Neue:Bold',sans-serif] text-[14px] tracking-[1.5px] uppercase text-white">
                      CLIENT REQUESTS
                    </h2>
                  </div>

                  {/* WAITLIST */}
                  {clientWaitlistOrders.length > 0 && (
                    <div>
                      <div className="bg-white border-t border-b border-black/70 px-[21px] py-3">
                        <div className="flex items-center justify-between">
                          <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709]/50">
                            Requests
                          </p>
                          <div className="w-[24px] h-[24px] rounded-full bg-[#1e1709] flex items-center justify-center">
                            <span className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] text-white">
                              {clientWaitlistOrders.length}
                            </span>
                          </div>
                        </div>
                      </div>
                      {clientWaitlistOrders.map(renderOrderRow)}
                    </div>
                  )}

                  {/* INVITED (AWAITING PAYMENT) */}
                  {clientInvitedOrders.length > 0 && (
                    <div>
                      <div className="bg-white border-t border-b border-black/70 px-[21px] py-3">
                        <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709]/50">
                          Awaiting Payment
                        </p>
                      </div>
                      {clientInvitedOrders.map(renderOrderRow)}
                    </div>
                  )}

                  {/* PAID (READY TO STYLE) */}
                  {clientPaidOrders.length > 0 && (
                    <div>
                      <div className="bg-white border-t border-b border-black/70 px-[21px] py-3">
                        <div className="flex items-center justify-between">
                          <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709]">
                            Ready to Style
                          </p>
                          <div className="w-[24px] h-[24px] rounded-full border border-[#1e1709] flex items-center justify-center">
                            <span className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] text-[#1e1709]">
                              {clientPaidOrders.length}
                            </span>
                          </div>
                        </div>
                      </div>
                      {clientPaidOrders.map(renderOrderRow)}
                    </div>
                  )}

                  {/* STYLING (IN PROGRESS) */}
                  {clientStylingOrders.length > 0 && (
                    <div>
                      <div className="bg-white border-t border-b border-black/70 px-[21px] py-3">
                        <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709]/50">
                          In Progress
                        </p>
                      </div>
                      {clientStylingOrders.map(renderOrderRow)}
                    </div>
                  )}

                  {/* SENT (COMPLETED) */}
                  {clientCompletedOrders.length > 0 && (
                    <div>
                      <div className="bg-white border-t border-b border-black/70 px-[21px] py-3">
                        <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709]/50">
                          Sent
                        </p>
                      </div>
                      {clientCompletedOrders.map(renderOrderRow)}
                    </div>
                  )}
                </div>
              )}

              {/* ==================== STYLING REQUESTS SECTION ==================== */}
              {stylingRequests.length > 0 && (
                <div>
                  {/* Section Header */}
                  <div className="bg-[#1e1709] px-[21px] py-4 border-b border-black">
                    <h2 className="font-['Helvetica_Neue:Bold',sans-serif] text-[14px] tracking-[1.5px] uppercase text-white">
                      STYLING REQUESTS
                    </h2>
                  </div>

                  {/* YOUR SELECTS (COMPLETED) - Show at top for clients */}
                  {stylingCompletedOrders.length > 0 && (
                    <div>
                      <div className="bg-white border-b border-black/70 px-[21px] py-3">
                        <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709]">
                          Your Selects
                        </p>
                      </div>
                      {stylingCompletedOrders.map(renderOrderRow)}
                    </div>
                  )}

                  {/* WAITLIST */}
                  {stylingWaitlistOrders.length > 0 && (
                    <div>
                      <div className="bg-white border-b border-black/70 px-[21px] py-3">
                        <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709]/50">
                          Waitlisted
                        </p>
                      </div>
                      {stylingWaitlistOrders.map(renderOrderRow)}
                    </div>
                  )}

                  {/* INVITED */}
                  {stylingInvitedOrders.length > 0 && (
                    <div>
                      <div className="bg-white border-t border-b border-black/70 px-[21px] py-3">
                        <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709]">
                          Invited
                        </p>
                      </div>
                      {stylingInvitedOrders.map(renderOrderRow)}
                    </div>
                  )}

                  {/* PAID */}
                  {stylingPaidOrders.length > 0 && (
                    <div>
                      <div className="bg-white border-t border-b border-black/70 px-[21px] py-3">
                        <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709]/50">
                          Ready to be Styled
                        </p>
                      </div>
                      {stylingPaidOrders.map(renderOrderRow)}
                    </div>
                  )}

                  {/* STYLING */}
                  {stylingStylingOrders.length > 0 && (
                    <div>
                      <div className="bg-white border-t border-b border-black/70 px-[21px] py-3">
                        <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709]/50">
                          In Progress
                        </p>
                      </div>
                      {stylingStylingOrders.map(renderOrderRow)}
                    </div>
                  )}
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