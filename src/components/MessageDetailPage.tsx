import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Send, Heart, MoreHorizontal, Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { GPTSearchPanel } from './GPTSearchPanel';

// Import stylist images
import imgLissyRoddy from "figma:asset/21ead93bac0da68ed5f33efdfb07c0bf632228cc.png";
import imgChrisWhyle from "figma:asset/083df4dc1c94d586d53c3644182d81e287c70454.png";

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

interface SelectedItem {
  id: string;
  url: string;
  image?: string;
  title?: string;
  price?: string;
  brand?: string;
  source: 'search' | 'voice' | 'manual';
  timestamp: string;
}

interface ProductData {
  productUrl: string;
  productName?: string;
  brand?: string;
  price?: string;
  imageUrl?: string;
}

export function MessageDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isCustomer, setIsCustomer] = useState(false);
  
  // Styling workspace state
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [stylingNotes, setStylingNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const userId = 'demo-user'; // TODO: Get from auth context
  
  // More menu state
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper function to format stylist name
  const formatStylistName = (stylistId: string) => {
    // Convert LISSY_RODDY to Lissy Roddy
    return stylistId
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getStylistImage = () => {
    if (!order) return imgLissyRoddy; // Default fallback if order is not loaded
    if (order.stylist_id?.toLowerCase().includes('lissy')) {
      return imgLissyRoddy;
    } else if (order.stylist_id?.toLowerCase().includes('chris')) {
      return imgChrisWhyle;
    }
    // Default fallback
    return imgLissyRoddy;
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Track initial load to prevent auto-save on first render
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load selections and styling notes when order changes
  useEffect(() => {
    if (order && !isCustomer && (order.status === 'invited' || order.status === 'paid' || order.status === 'styling')) {
      loadStylingData();
    }
    // Also load selections when order is completed (for both customers and stylists)
    if (order && order.status === 'completed') {
      loadStylingData();
    }
  }, [order?.id, order?.status, isCustomer]); // Use specific order properties instead of full object

  // Debug: Log the selectedItems whenever they change
  useEffect(() => {
    if (selectedItems.length > 0) {
      console.log('📊 CURRENT SELECTED ITEMS:', selectedItems);
      console.log('📊 URLs present?', selectedItems.map((item, i) => `Item ${i+1}: ${!!item.url} (${item.url})`));
    }
  }, [selectedItems]);

  // Auto-save selections whenever they change (but skip initial load)
  useEffect(() => {
    // Skip the first render to avoid saving immediately after loading
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    
    if (order && selectedItems.length > 0 && !isCustomer) {
      saveSelections();
    }
  }, [selectedItems]); // Only trigger on selectedItems changes

  // Auto-save styling notes (with debounce)
  useEffect(() => {
    if (!order || isCustomer) return;
    
    const timer = setTimeout(() => {
      if (stylingNotes.trim() !== '') {
        saveSelections();
      }
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timer);
  }, [stylingNotes]); // Only trigger on stylingNotes changes

  const loadStylingData = async () => {
    if (!order) return;

    try {
      // Load saved selections from Supabase
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/selections/get/${order.id}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          console.log('✅ Loaded selections:', data.data);
          console.log('📦 Items loaded:', data.data.items);
          
          // Log each item's URL to debug
          data.data.items?.forEach((item: any, idx: number) => {
            console.log(`Item ${idx + 1}:`, {
              id: item.id,
              url: item.url,
              title: item.title,
              hasUrl: !!item.url,
              urlValue: item.url,
            });
          });
          
          setSelectedItems(data.data.items || []);
          setStylingNotes(data.data.stylingNotes || '');
        } else {
          // No saved data, start fresh
          setSelectedItems([]);
          setStylingNotes('');
        }
      }
    } catch (error) {
      console.error('Error loading styling data:', error);
    }
  };

  const saveSelections = async () => {
    if (!order) return;

    try {
      setIsSaving(true);
      console.log('💾 Saving selections...');

      // Get stylist info from the order
      const stylistName = formatStylistName(order.stylist_id);
      const stylistImage = getStylistImage();
      
      console.log('🎨 Stylist data:', {
        stylistId: order.stylist_id,
        stylistName,
        stylistImage,
        stylistImageType: typeof stylistImage,
      });

      const payload = {
        customerId: order.id,
        clientEmail: order.customer_email,
        clientImage: order.main_image_url,
        clientName: order.customer_name,
        stylistName,
        stylistImage,
        items: selectedItems.map(item => ({
          id: item.id,
          url: item.url,
          title: item.title || '',
          image: item.image || '',
          price: item.price || '',
          brand: item.brand || '',
          source: item.source,
          timestamp: item.timestamp,
        })),
        stylingNotes,
      };

      console.log('📤 Full payload being sent:', JSON.stringify(payload, null, 2));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/selections/save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        console.log('✅ Selections saved');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to save selections:', errorData);
      }
    } catch (error) {
      console.error('Error saving selections:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmail = async () => {
    if (!order) return;

    // Validation
    if (selectedItems.length < 7) {
      toast.error(`Need exactly 7 products (you have ${selectedItems.length})`);
      return;
    }

    if (!stylingNotes.trim()) {
      toast.error('Please add styling notes before sending');
      return;
    }

    try {
      setIsSendingEmail(true);
      console.log('📦 Sending selections to customer...');

      // First, ensure everything is saved
      await saveSelections();

      // Update order status to "completed" (sent)
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/${order.id}/status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            status: 'completed',
          }),
        }
      );

      if (response.ok) {
        toast.success(`✅ Selections sent to ${order.customer_name}!`);
        // Navigate back to messages list
        setTimeout(() => navigate('/messages'), 1000);
      } else {
        const errorData = await response.json();
        console.error('Send error:', errorData);
        toast.error('Failed to send selections');
      }
    } catch (error) {
      console.error('Error sending selections:', error);
      toast.error('Failed to send selections');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const addItem = (urlOrProduct: string | ProductData, source: 'search' | 'voice' = 'search') => {
    if (selectedItems.length >= 7) {
      toast.error('Maximum 7 items reached');
      return;
    }

    console.log('🔵 ADD ITEM CALLED WITH:', urlOrProduct);
    console.log('🔵 Type:', typeof urlOrProduct);

    // Determine if we have preloaded product data
    const isProductData = typeof urlOrProduct === 'object' && urlOrProduct !== null;
    const url = isProductData ? urlOrProduct.productUrl : urlOrProduct;
    const hasPreloadedData = isProductData && (urlOrProduct.productName || urlOrProduct.imageUrl || urlOrProduct.price);

    console.log('🔵 Is product data?:', isProductData);
    console.log('🔵 Has preloaded data?:', hasPreloadedData);
    if (isProductData) {
      console.log('🔵 Product data:', {
        name: urlOrProduct.productName,
        image: urlOrProduct.imageUrl,
        price: urlOrProduct.price,
        brand: urlOrProduct.brand,
      });
    }

    // Create item with basic info first
    const newItem: SelectedItem = {
      id: `${Date.now()}-${Math.random()}`,
      url,
      source,
      timestamp: new Date().toISOString(),
      // If we have preloaded data from AI/search, use it immediately
      ...(hasPreloadedData && {
        title: urlOrProduct.productName || undefined,
        image: urlOrProduct.imageUrl || undefined,
        price: urlOrProduct.price || undefined,
        brand: urlOrProduct.brand || undefined,
      }),
    };

    console.log('🔵 NEW ITEM CREATED:', newItem);
    console.log('🔵 Has preloaded image?:', !!newItem.image);

    // Add to list immediately
    setSelectedItems([...selectedItems, newItem]);

    console.log('🔵 ITEM ADDED TO STATE');

    // Only fetch metadata if we don't have preloaded data
    if (!hasPreloadedData) {
      console.log('🔵 No preloaded data, fetching metadata for URL:', url);
      // Fetch metadata in background
      fetchMetadata(url, newItem.id);
    } else {
      console.log('🔵 ✅ Using preloaded data, skipping metadata fetch');
    }
  };

  const fetchMetadata = async (url: string, itemId: string) => {
    try {
      console.log('🔍 Fetching metadata for:', url);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/fetch-url-metadata`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ url }),
        }
      );

      console.log('📡 Metadata response status:', response.status);

      if (response.ok) {
        const metadata = await response.json();
        console.log('✅ Metadata received:', {
          url: metadata.url,
          title: metadata.title,
          hasImage: !!metadata.image,
          imageUrl: metadata.image,
          price: metadata.price,
          brand: metadata.brand,
        });
        
        // Update the item with metadata
        setSelectedItems(items =>
          items.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  title: metadata.title || 'Product Link',
                  image: metadata.image || '',
                  price: metadata.price || '',
                  brand: metadata.brand || '',
                }
              : item
          )
        );
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch metadata:', response.status, errorText);
        
        // Update item to show it failed but keep the URL
        setSelectedItems(items =>
          items.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  title: 'Product Link',
                  image: '',
                  brand: '',
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error('❌ Error fetching metadata:', error);
    }
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const handleLike = async (item: SelectedItem) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/likes/like`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            productId: item.id,
            productData: {
              title: item.title || '',
              imageUrl: item.image || item.url,
              price: item.price || '',
              brand: item.brand || '',
              url: item.url,
            },
          }),
        }
      );

      if (response.ok) {
        setLikedItems(new Set([...likedItems, item.id]));
        toast.success('Added to likes!');
      }
    } catch (error) {
      console.error('Error liking product:', error);
      toast.error('Failed to like product');
    }
  };

  const handleUnlike = async (productId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/likes/unlike`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ userId, productId }),
        }
      );

      if (response.ok) {
        const newLiked = new Set(likedItems);
        newLiked.delete(productId);
        setLikedItems(newLiked);
        toast.success('Removed from likes');
      }
    } catch (error) {
      console.error('Error unliking product:', error);
      toast.error('Failed to unlike product');
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      
      // Use localStorage token like the rest of the app
      const accessToken = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
      
      if (!accessToken) {
        console.error('❌ No access token found in localStorage');
        toast.error('Please sign in');
        navigate('/signin');
        return;
      }
      
      console.log('🔐 Access token found, fetching order...');
      
      // Get the current user's ID from their profile (this also validates the token)
      const profileResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/profiles/me`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('❌ Profile fetch failed:', profileResponse.status, errorText);
        
        // If auth error, clear everything and redirect
        if (profileResponse.status === 401 || profileResponse.status === 403) {
          console.error('❌ Token invalid - clearing and redirecting to signin');
          localStorage.clear();
          await supabase.auth.signOut();
          toast.error('Session expired. Please sign in again.');
          setTimeout(() => navigate('/signin'), 100);
          return;
        }
        
        throw new Error(`Failed to fetch user profile: ${profileResponse.status} - ${errorText}`);
      }

      const profileData = await profileResponse.json();
      const userId = profileData.profile?.auth_user_id || profileData.profile?.user_id;
      
      console.log('👤 Current user ID:', userId);
      
      console.log('🔍 Fetching order:', orderId);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched order:', data.order);
        console.log('📊 Order customer_id:', data.order.customer_id);
        console.log('📊 Current user ID:', userId);
        console.log(' Is Customer?:', data.order.customer_id === userId);
        
        setOrder(data.order);
        setCurrentUserId(userId);
        setIsCustomer(data.order.customer_id === userId);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch order:', errorText);
        toast.error('Failed to load order');
        navigate('/messages');
      }
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!order || order.status !== 'waitlist') return;

    try {
      setActionLoading(true);
      
      console.log('💌 Sending invite for order:', order.id);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/${order.id}/invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Invite sent:', data);
        toast.success(`Invite sent to ${order.customer_name}!`);
        
        // Update local order state
        setOrder(data.order);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to send invite:', errorText);
        toast.error('Failed to send invite');
      }
    } catch (error) {
      console.error('❌ Error sending invite:', error);
      toast.error('Failed to send invite');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!order || !orderId) return;

    // Show confirmation with appropriate message
    const confirmMessage = isCustomer 
      ? 'Delete your style request? This cannot be undone.'
      : `Delete this message from ${order.customer_name}? This cannot be undone.`;
    
    if (!confirm(confirmMessage)) {
      setShowMoreMenu(false);
      return;
    }

    try {
      setIsDeleting(true);
      console.log('🗑️ Deleting order:', orderId);

      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        toast.error('Please sign in');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/${orderId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        console.log('✅ Order deleted');
        toast.success('Message deleted');
        // Navigate back to messages list
        navigate('/messages');
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to delete order:', errorText);
        toast.error('Failed to delete message');
      }
    } catch (error) {
      console.error('❌ Error deleting order:', error);
      toast.error('Failed to delete message');
    } finally {
      setIsDeleting(false);
      setShowMoreMenu(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1e1709] animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709]/50">
          Order not found
        </p>
      </div>
    );
  }

  const questions = [
    'What are you hoping to get styled for?',
    'What brands do you like?',
    'Do you have any wardrobe gaps?',
    'Any fit or sizing notes we should know?',
    'What\'s your budget range?',
    'Anything else you want us to know?',
  ];

  // CUSTOMER VIEW - INVITED (Waiting for Payment)
  if (isCustomer && order.status === 'invited') {
    return (
      <div 
        className="min-h-screen bg-white w-full overflow-x-hidden"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div 
          className="w-full mx-auto px-6"
          style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 h-[48px] border-b border-gray-100 -mx-6 px-6 mb-6">
            <div className="h-full flex items-center justify-center relative">
              <button
                onClick={() => navigate('/customer-inbox')}
                className="absolute left-0 flex items-center gap-1 text-black hover:opacity-70 transition-opacity"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <span className="font-['Helvetica_Neue:Medium',sans-serif] text-[15px] tracking-[0.5px] uppercase">
                You're Invited
              </span>
            </div>
          </div>

          {/* Stylist Photo with Card Stack Effect */}
          <div className="flex justify-center mb-8">
            <div className="relative size-[225px] rounded-[1px]" style={{ border: '1px solid #1e1709' }}>
              {/* Layered circular images */}
              <div className="absolute inset-[5.05%_4.71%_4.69%_4.71%] pointer-events-none rounded-[147px]">
                <img 
                  alt={order.stylist_id}
                  loading="lazy" 
                  className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" 
                  src={getStylistImage()} 
                />
                <img 
                  alt={order.stylist_id}
                  loading="lazy" 
                  className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" 
                  src={getStylistImage()} 
                />
                <img 
                  alt={order.stylist_id}
                  loading="lazy" 
                  className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" 
                  src={getStylistImage()} 
                />
                <div className="absolute inset-0 rounded-[147px]" style={{ border: '1px solid #EAEAEA' }} />
              </div>
              
              {/* Name badge */}
              <div className="absolute inset-[80%_5.97%_9.26%_6.11%]">
                <div className="absolute bg-[rgba(255,254,253,0.8)] inset-0 rounded-[8px]" style={{ border: '1px solid #1e1709' }} />
                <div className="absolute flex flex-col font-['Helvetica_Neue:Regular',sans-serif] inset-[0_0_0_0] justify-center items-center leading-[14px] text-[#1e1709] text-[12px] tracking-[0.5px] uppercase">
                  <p>{formatStylistName(order.stylist_id)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Prompt */}
          <div className="mb-8 text-center">
            <p className="font-['Helvetica_Neue:Bold',sans-serif] text-[18px] leading-[24px] tracking-[1px] uppercase text-[#1e1709] mb-3">
              Complete to Be Styled by {formatStylistName(order.stylist_id)}
            </p>
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] leading-[20px] tracking-[0.5px] text-[#1e1709]/70 mb-2">
              You can edit your intake until payment is complete.
            </p>
            <button
              onClick={() => navigate(`/lissy/intake/edit/${order.id}`)}
              className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] underline text-[#1e1709] hover:opacity-70"
            >
              Edit Your Intake Form
            </button>
          </div>

          {/* Payment Button */}
          <div className="mb-8">
            <button
              onClick={async () => {
                try {
                  setActionLoading(true);
                  const accessToken = localStorage.getItem('access_token');
                  
                  // Mock payment - update status to "paid"
                  const response = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/${order.id}/status`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                      },
                      body: JSON.stringify({
                        status: 'paid',
                      }),
                    }
                  );

                  if (!response.ok) {
                    throw new Error('Failed to process payment');
                  }

                  toast.success('Payment successful! Your stylist will begin curating your edit.');
                  
                  // Refresh order
                  await fetchOrder();
                } catch (error: any) {
                  console.error('❌ Payment error:', error);
                  toast.error(error.message || 'Payment failed. Please try again.');
                } finally {
                  setActionLoading(false);
                }
              }}
              disabled={actionLoading}
              className="w-full h-[52px] bg-[#1e1709] text-white rounded-[8px] font-['Helvetica_Neue:Bold',sans-serif] text-[16px] uppercase hover:bg-[#2a2010] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                'PURCHASE'
              )}
            </button>
          </div>

          {/* What's Included */}
          <div className="mb-8 border border-[#1E1709]/10 rounded-lg p-4">
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[11px] tracking-[1.5px] uppercase mb-3 text-[#1E1709]">
              What You Get
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709]">
                  7-Item Curated Edit
                </span>
                <span className="font-['Helvetica_Neue:Medium',sans-serif] text-[13px] text-[#1e1709]">
                  Included
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709]">
                  Personal Styling Notes
                </span>
                <span className="font-['Helvetica_Neue:Medium',sans-serif] text-[13px] text-[#1e1709]">
                  Included
                </span>
              </div>
            </div>
          </div>

          {/* Style Intake Section (View Only) */}
          <div className="mb-8">
            <h2 className="font-['Helvetica_Neue:Regular',sans-serif] text-[11px] tracking-[1.5px] uppercase mb-4 text-[#1E1709]">
              Your Style Intake
            </h2>
            <div className="border border-[#1E1709]/10 rounded-lg p-4">
              <div className="space-y-6">
                {order.intake_answers && Object.entries(order.intake_answers).map(([key, value], idx) => {
                  if (!value) return null;
                  return (
                    <div key={key} className="pb-6 border-b border-[#1E1709]/10 last:border-b-0 last:pb-0">
                      <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1E1709]/60 mb-2">
                        {questions[idx] || key}
                      </p>
                      <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1E1709]">
                        {value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* References Section */}
          {order.reference_images && order.reference_images.length > 0 && (
            <div className="mb-8">
              <h2 className="font-['Helvetica_Neue:Regular',sans-serif] text-[11px] tracking-[1.5px] uppercase mb-4 text-[#1E1709]">
                Your References
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {order.reference_images.map((imgUrl, idx) => (
                  <div key={idx} className="w-[207px] h-[368px] rounded-[8px] overflow-hidden border-[1px] border-[#1E1709] bg-white shrink-0">
                    <img 
                      src={imgUrl} 
                      alt={`Reference ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // COMPLETED VIEW - Both customers and stylists see the final selections
  if (order.status === 'completed') {
    return (
      <div className="min-h-screen bg-white w-full">
        <div className="w-full max-w-[393px] mx-auto px-6 pb-8">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 py-6 -mx-6 px-6 mb-6">
            <div className="flex items-center justify-center relative">
              <button
                onClick={() => navigate('/messages')}
                className="absolute left-0 flex items-center gap-1 text-black hover:opacity-70 transition-opacity"
              >
                <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
              </button>
              
              <div className="text-center">
                <h1 className="font-['Helvetica_Neue:Regular',sans-serif] text-[24px] leading-[22px] tracking-[3px] uppercase text-black">
                  INBOX
                </h1>
              </div>
            </div>
          </div>

          {/* Client Image with Card Stack */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Card stack layers */}
              <div className="absolute inset-0 border-[1px] border-[#1E1709] rounded-[8px] bg-white" style={{ transform: 'translate(8px, 8px)' }} />
              <div className="absolute inset-0 border-[1px] border-[#1E1709] rounded-[8px] bg-white" style={{ transform: 'translate(4px, 4px)' }} />
              <div className="w-[286px] h-[368px] rounded-[8px] overflow-hidden border-[1px] border-[#1E1709] relative z-10 bg-white">
                {order.main_image_url ? (
                  <img 
                    src={order.main_image_url} 
                    alt="Your style"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                    No Photo
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[18px] leading-[normal] tracking-[2px] uppercase text-[#1e1709] text-center mb-4">
            YOUR SEVN SELECTS
          </h2>

          {/* Subtitle */}
          <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] leading-[24px] tracking-[1px] uppercase text-[#1e1709] text-center mb-6">
            Handpicked Edit + styling tips
          </p>

          {/* Line Divider */}
          <div className="w-full h-0 mb-6">
            <svg className="block w-full h-[1px]" fill="none" preserveAspectRatio="none" viewBox="0 0 349 1">
              <line stroke="#1e1709" strokeOpacity="0.15" x2="349" y1="0.5" y2="0.5" />
            </svg>
          </div>

          {/* Stylist Card */}
          <div className="flex justify-center mt-8 mb-6">
            <div className="relative w-[184px] h-[184px]">
              <img 
                alt={formatStylistName(order.stylist_id)}
                className="absolute inset-0 w-full h-full object-cover rounded-full" 
                src={getStylistImage()} 
              />
              
              {/* Name badge */}
              <div className="absolute bottom-[6px] left-[6px] right-[6px] h-[24px]">
                <div className="absolute bg-[rgba(255,254,253,0.8)] inset-0 rounded-[20px]" style={{ border: '1px solid #130326' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] leading-[22px] tracking-[2px] uppercase text-[#130326]">
                    {formatStylistName(order.stylist_id)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Styling Notes Section */}
          <h3 className="font-['Helvetica_Neue:Regular',sans-serif] text-[18px] leading-[normal] tracking-[2px] uppercase text-[#1e1709] text-center mb-4">
            STYLING NOTES
          </h3>

          <div className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] leading-[1.8] tracking-[1px] text-[#1e1709] mb-8 whitespace-pre-wrap max-w-[86%] mx-auto">
            {stylingNotes || 'Your stylist is preparing your personalized styling notes...'}
          </div>

          {/* Line Divider */}
          <div className="w-full h-0 mb-8">
            <svg className="block w-full h-[1px]" fill="none" preserveAspectRatio="none" viewBox="0 0 349 1">
              <line stroke="#1e1709" strokeOpacity="0.15" x2="349" y1="0.5" y2="0.5" />
            </svg>
          </div>

          {/* Sevn Selects Products Section */}
          <h3 className="font-['Helvetica_Neue:Regular',sans-serif] text-[18px] leading-[normal] tracking-[2px] uppercase text-[#1e1709] text-center mb-6">
            SEVN SELECTS
          </h3>

          {/* Product Grid */}
          {selectedItems.length > 0 ? (
            <div className="space-y-8 mb-8">
              {/* First large product */}
              {selectedItems[0] && (
                <a
                  key={selectedItems[0].id}
                  href={selectedItems[0].url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!selectedItems[0].url || selectedItems[0].url.trim() === '') {
                      console.warn('⚠️ Product 1 has no URL');
                      toast.error('This product link is not available');
                      return;
                    }
                    console.log('✅ Product 1 clicked:', selectedItems[0].url);
                    window.open(selectedItems[0].url, '_blank');
                  }}
                >
                  <div className="border border-black rounded-[5px] overflow-hidden bg-white">
                    {/* Product Image */}
                    <div className="h-[559px] bg-gray-100">
                      {selectedItems[0].image ? (
                        <img 
                          src={selectedItems[0].image} 
                          alt={selectedItems[0].title || 'Product 1'}
                          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Metadata - Inside the border */}
                    <div className="p-4 h-[90px] flex flex-col">
                      <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[10px] text-[#1e1709]/60 uppercase mb-1 truncate">
                        {selectedItems[0].brand || '\u00A0'}
                      </p>
                      <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709] mb-1 line-clamp-1">
                        {selectedItems[0].title || '\u00A0'}
                      </p>
                      <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] text-[#1e1709] mt-auto">
                        {selectedItems[0].price || '\u00A0'}
                      </p>
                    </div>
                  </div>
                </a>
              )}
              
              {/* Remaining 6 products in 2-column grid */}
              {selectedItems.length > 1 && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedItems.slice(1, 7).map((item, idx) => (
                    <a
                      key={item.id}
                      href={item.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!item.url || item.url.trim() === '') {
                          console.warn(`⚠️ Product ${idx + 2} has no URL`);
                          toast.error('This product link is not available');
                          return;
                        }
                        console.log(`✅ Product ${idx + 2} clicked:`, item.url);
                        window.open(item.url, '_blank');
                      }}
                    >
                      <div className="border border-black rounded-[5px] overflow-hidden bg-white">
                        {/* Product Image */}
                        <div className="h-[245px] bg-gray-100">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.title || `Product ${idx + 2}`}
                              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Product Metadata - Inside the border */}
                        <div className="p-4 h-[90px] flex flex-col">
                          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[10px] text-[#1e1709]/60 uppercase mb-1 truncate">
                            {item.brand || '\u00A0'}
                          </p>
                          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709] mb-1 line-clamp-1">
                            {item.title || '\u00A0'}
                          </p>
                          <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] text-[#1e1709] mt-auto">
                            {item.price || '\u00A0'}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px]">
                Loading your selections...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // STYLIST VIEW - READY TO STYLE (paid or styling status)
  if (!isCustomer && (order.status === 'invited' || order.status === 'paid' || order.status === 'styling')) {
    return (
      <div className="w-full min-h-screen overflow-x-hidden bg-white">
        <div className="w-full max-w-[393px] mx-auto relative pb-8">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 pt-5 pb-4 border-b border-black/70">
            <div className="flex items-center justify-center px-4 relative">
              <button 
                onClick={() => navigate('/messages')}
                className="absolute left-4 w-6 h-6 flex items-center justify-center"
              >
                <ArrowLeft className="w-6 h-6 text-[#1e1709]" strokeWidth={1.5} />
              </button>
              
              <h1 className="font-['Helvetica_Neue:Regular',sans-serif] text-[26px] tracking-[3px] text-black uppercase">
                Seven Selects
              </h1>
              
              {/* More menu button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Menu button clicked, current state:', showMoreMenu);
                  setShowMoreMenu(!showMoreMenu);
                }}
                className="absolute right-4 w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded transition-colors z-50"
              >
                <MoreHorizontal className="w-5 h-5 text-[#1e1709]" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          
          {/* More menu dropdown - moved outside header */}
          {showMoreMenu && (
            <div className="relative">
              {/* Backdrop to close menu */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Backdrop clicked');
                  setShowMoreMenu(false);
                }}
              />
              
              {/* Menu */}
              <div className="absolute right-4 top-0 w-48 bg-white border border-black/10 rounded-lg shadow-lg overflow-hidden z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMessage();
                  }}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-600" strokeWidth={1.5} />
                  )}
                  <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-red-600">
                    {isDeleting ? 'Deleting...' : 'Delete Message'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* CLIENT Section */}
          <div className="px-4 pt-6">
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[20px] tracking-[2px] text-[#1e1709] uppercase mb-4">
              Client
            </h2>
            
            {/* Client Image */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                {/* Card stack layers - 1px lines, 4px apart */}
                <div className="absolute inset-0 border-[1px] border-[#1E1709] rounded-[16px] bg-white" style={{ transform: 'translate(8px, 8px)' }} />
                <div className="absolute inset-0 border-[1px] border-[#1E1709] rounded-[16px] bg-white" style={{ transform: 'translate(4px, 4px)' }} />
                <div className="w-[280px] aspect-[3/4] border-[1px] border-[#1E1709] rounded-[16px] overflow-hidden bg-white relative z-10">
                  {order.main_image_url ? (
                    <img 
                      src={order.main_image_url} 
                      alt={order.customer_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                      <span className="font-['Helvetica_Neue:Bold',sans-serif] text-[48px] text-gray-500">
                        {order.customer_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Intake Answers */}
            <div className="mb-6">
              <h3 className="font-['Helvetica_Neue:Medium',sans-serif] text-[16px] tracking-[1.5px] text-[#1e1709] uppercase mb-3">
                Intake Answers
              </h3>
              <div className="border border-[#1E1709]/10 rounded-lg p-4">
                <div className="space-y-6">
                  {order.intake_answers && Object.entries(order.intake_answers).map(([key, value], idx) => {
                    if (!value) return null;
                    return (
                      <div key={key} className="pb-6 border-b border-[#1E1709]/10 last:border-b-0 last:pb-0">
                        <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1E1709]/60 mb-2">
                          {questions[idx] || key}
                        </p>
                        <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1E1709]">
                          {value}
                        </p>
                      </div>
                    );
                  })}
                  {order.customer_email && (
                    <div className="pb-6 border-b border-[#1E1709]/10 last:border-b-0 last:pb-0">
                      <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1E1709]/60 mb-2">Email</p>
                      <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1E1709]">{order.customer_email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reference Images */}
            {order.reference_images && order.reference_images.length > 0 && (
              <div className="mb-8">
                <h3 className="font-['Helvetica_Neue:Medium',sans-serif] text-[16px] tracking-[1.5px] text-[#1e1709] uppercase mb-3">
                  References
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {order.reference_images.map((imgUrl, idx) => (
                    <div key={idx} className="w-[207px] h-[368px] rounded-[8px] overflow-hidden border-[1px] border-[#1E1709] bg-white shrink-0">
                      <img 
                        src={imgUrl} 
                        alt={`Reference ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Line Divider */}
          <div className="mt-8 px-4 flex justify-center">
            <div className="h-0 w-full">
              <svg className="block w-full h-[1px]" fill="none" preserveAspectRatio="none" viewBox="0 0 349 1">
                <line stroke="black" x2="349" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>

          {/* Styling Notes Section */}
          <div className="mt-8 px-4">
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[20px] tracking-[2px] text-[#1e1709] uppercase mb-4">
              Styling Notes
            </h2>
            
            <div className="border border-black/10">
              <textarea
                value={stylingNotes}
                onChange={(e) => setStylingNotes(e.target.value)}
                placeholder="Add personalized styling notes for this client..."
                className="w-full min-h-[150px] bg-white p-4 font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] leading-[26px] tracking-[0.5px] resize-none focus:outline-none"
              />
            </div>
          </div>

          {/* Line Divider */}
          <div className="mt-8 px-4 flex justify-center">
            <div className="h-0 w-full">
              <svg className="block w-full h-[1px]" fill="none" preserveAspectRatio="none" viewBox="0 0 349 1">
                <line stroke="black" x2="349" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>

          {/* Your Picks Section */}
          <div className="mt-8 px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[20px] tracking-[2px] text-[#1e1709] uppercase">
                Your Picks ({selectedItems.length}/7)
              </h2>
              <button
                onClick={handleSendEmail}
                className="flex items-center space-x-2 px-4 py-2 bg-[#1e1709] text-white rounded-lg hover:bg-[#1e1709]/80 transition-colors"
                disabled={isSendingEmail}
              >
                {isSendingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send</span>
              </button>
            </div>

            {selectedItems.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-gray-500">
                  No items selected yet. Use the search above to find products.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {selectedItems.map((item) => {
                  const isLiked = likedItems.has(item.id);
                  
                  return (
                    <div key={item.id} className="relative group">
                      <div className="aspect-square rounded-lg border border-black overflow-hidden bg-gray-100">
                        <img 
                          src={item.image || item.url} 
                          alt={item.title || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {/* Like Button */}
                        <button
                          onClick={() => isLiked ? handleUnlike(item.id) : handleLike(item)}
                          className="w-6 h-6 bg-white border border-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                        >
                          <Heart 
                            className={`w-3.5 h-3.5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-black'}`}
                            strokeWidth={2}
                          />
                        </button>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                      
                      {item.title && (
                        <p className="mt-2 text-xs text-gray-700 line-clamp-2">{item.title}</p>
                      )}
                      {item.price && (
                        <p className="text-xs font-semibold text-[#1e1709]">{item.price}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Line Divider */}
          <div className="mt-8 px-4 flex justify-center">
            <div className="h-0 w-full">
              <svg className="block w-full h-[1px]" fill="none" preserveAspectRatio="none" viewBox="0 0 349 1">
                <line stroke="black" x2="349" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>

          {/* Curate Section */}
          <div className="mt-8 px-4">
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[20px] tracking-[2px] text-[#1e1709] uppercase mb-4">
              Curate
            </h2>
            
            <div className="border border-black/20 rounded-lg overflow-hidden">
              <GPTSearchPanel 
                onAddItem={addItem}
                selectedCustomer={{ sys: { id: order.id }, fields: { email: order.customer_email, name: order.customer_name } }}
                selectedItems={selectedItems}
                onRemoveItem={removeItem}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STYLIST VIEW - WAITLIST STATUS (Simple Style Request)
  return (
    <div 
      className="min-h-screen bg-white w-full overflow-x-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div 
        className="w-full mx-auto px-6"
        style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 h-[48px] border-b border-gray-100 -mx-6 px-6 mb-6">
          <div className="h-full flex items-center justify-center relative">
            <button
              onClick={() => navigate('/messages')}
              className="absolute left-0 flex items-center gap-1 text-black hover:opacity-70 transition-opacity"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <span className="font-['Helvetica_Neue:Medium',sans-serif] text-[15px] tracking-[0.5px] uppercase">
              Style Request
            </span>
            
            {/* More menu button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Menu button clicked, current state:', showMoreMenu);
                setShowMoreMenu(!showMoreMenu);
              }}
              className="absolute right-0 w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded transition-colors z-50"
            >
              <MoreHorizontal className="w-5 h-5 text-[#1e1709]" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        
        {/* More menu dropdown */}
        {showMoreMenu && (
          <div className="relative">
            {/* Backdrop to close menu */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={(e) => {
                e.stopPropagation();
                console.log('Backdrop clicked');
                setShowMoreMenu(false);
              }}
            />
            
            {/* Menu */}
            <div className="absolute right-6 top-0 w-48 bg-white border border-black/10 rounded-lg shadow-lg overflow-hidden z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMessage();
                }}
                disabled={isDeleting}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 text-red-600" strokeWidth={1.5} />
                )}
                <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-red-600">
                  {isDeleting ? 'Deleting...' : 'Delete Message'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Customer Photo with Card Stack Effect */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            {/* Card stack layers - 1px lines, 4px apart */}
            <div className="absolute inset-0 border-[1px] border-[#1E1709] rounded-[8px] bg-white" style={{ transform: 'translate(8px, 8px)' }} />
            <div className="absolute inset-0 border-[1px] border-[#1E1709] rounded-[8px] bg-white" style={{ transform: 'translate(4px, 4px)' }} />
            <div className="w-[286px] h-[368px] rounded-[8px] overflow-hidden border-[1px] border-[#1E1709] relative z-10 bg-white">
              {order.main_image_url ? (
                <img 
                  src={order.main_image_url} 
                  alt="Client style reference"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                  No Photo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Combined Status and Date Box */}
        <div className="flex justify-center mb-12">
          <div className="font-['Helvetica_Neue:Medium',sans-serif] text-[13px] tracking-[0.5px] uppercase text-black">
            {order.status === 'waitlist' && `WAITLISTED · ${new Date(order.created_at).toLocaleDateString('en-US', { 
              month: 'numeric', 
              day: 'numeric', 
              year: '2-digit' 
            }).replace(/\//g, '/')}`}
            {order.status === 'invited' && `INVITED · ${order.invited_at ? new Date(order.invited_at).toLocaleDateString('en-US', { 
              month: 'numeric', 
              day: 'numeric', 
              year: '2-digit' 
            }).replace(/\//g, '/') : ''}`}
          </div>
        </div>

        {/* Style Intake Section */}
        <div className="mb-8">
          <h2 className="font-['Helvetica_Neue:Regular',sans-serif] text-[11px] tracking-[1.5px] uppercase mb-4 text-[#1E1709]">
            STYLE INTAKE
          </h2>
          <div className="border border-[#1E1709]/10 rounded-lg p-4">
            <div className="space-y-6">
              {order.intake_answers && Object.entries(order.intake_answers).map(([key, value], idx) => {
                if (!value) return null;
                return (
                  <div key={key} className="pb-6 border-b border-[#1E1709]/10 last:border-b-0 last:pb-0">
                    <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1E1709]/60 mb-2">
                      {questions[idx] || key}
                    </p>
                    <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1E1709]">
                      {value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* References Section */}
        {order.reference_images && order.reference_images.length > 0 && (
          <div className="mb-8">
            <h2 className="font-['Helvetica_Neue:Regular',sans-serif] text-[11px] tracking-[1.5px] uppercase mb-4 text-[#1E1709]">
              REFERENCES
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {order.reference_images.map((imgUrl, idx) => (
                <div key={idx} className="w-[207px] h-[368px] rounded-[8px] overflow-hidden border-[1px] border-[#1E1709] bg-white shrink-0">
                  <img 
                    src={imgUrl} 
                    alt={`Reference ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {!isCustomer && order.status === 'waitlist' && (
          <div className="mt-8">
            <button
              onClick={handleInvite}
              disabled={actionLoading}
              className="w-full h-[52px] bg-[#1e1709] text-white rounded-[8px] font-['Helvetica_Neue:Bold',sans-serif] text-[16px] uppercase hover:bg-[#2a2010] transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'INVITE'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}