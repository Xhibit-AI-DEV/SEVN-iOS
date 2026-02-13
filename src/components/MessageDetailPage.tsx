import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Loader2, Send, Heart, MoreHorizontal, Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { GPTSearchPanel } from './GPTSearchPanel';

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

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Load selections and styling notes when order changes
  useEffect(() => {
    if (order && !isCustomer && (order.status === 'invited' || order.status === 'paid' || order.status === 'styling')) {
      loadStylingData();
    }
  }, [order, isCustomer]);

  // Auto-save selections whenever they change
  useEffect(() => {
    if (order && selectedItems.length > 0 && !isCustomer) {
      saveSelections();
    }
  }, [selectedItems]);

  // Auto-save styling notes (with debounce)
  useEffect(() => {
    if (!order || isCustomer) return;
    
    const timer = setTimeout(() => {
      if (stylingNotes.trim() !== '') {
        saveSelections();
      }
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timer);
  }, [stylingNotes]);

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

      // Get stylist info
      const stylistName = 'Lissy'; // TODO: Get from logged-in stylist
      const stylistImage = ''; // TODO: Get from logged-in stylist

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/selections/save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
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
          }),
        }
      );

      if (response.ok) {
        console.log('✅ Selections saved');
      } else {
        console.error('❌ Failed to save selections');
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
      console.log('📧 Sending email...');

      // First, ensure everything is saved
      await saveSelections();

      // Send email using the /send-from-storage endpoint
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/sendgrid/send-from-storage/${order.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`✅ Email sent to ${data.emailSentTo}!`);
      } else {
        const errorData = await response.json();
        console.error('Email error:', errorData);
        
        // Show specific error message
        if (errorData.validationErrors) {
          toast.error(`Missing: ${errorData.validationErrors.join(', ')}`);
        } else {
          toast.error(`Failed to send: ${errorData.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
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
                }
              : item
          )
        );
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch metadata:', response.status, errorText);
        
        // Update item to show it failed
        setSelectedItems(items =>
          items.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  title: 'Product Link',
                  image: '',
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
      
      // Get current user profile first
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        toast.error('Please sign in');
        navigate('/signin');
        return;
      }
      
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
    'What are you looking to be styled for?',
    'What\'s the vibe you\'re going for?',
    'Are there any brands, styles, or references you love?',
    'Anything you don\'t like or want to avoid?',
    'Is this for a specific time or occasion?',
    'Any fit or sizing notes we should know?',
    'What\'s your budget range?',
    'Anything else you want us to know?',
  ];

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