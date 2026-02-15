import { useState, useEffect } from 'react';
import { ArrowLeft, Send, Loader2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GPTSearchPanel } from './GPTSearchPanel';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Customer {
  sys: {
    id: string;
    createdAt: string;
  };
  fields: any;
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

// Helper function to get field values from Contentful
const getFieldValue = (field: any): any => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (field['en-US']) return field['en-US'];
  if (field['en']) return field['en'];
  return '';
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [stylingNotes, setStylingNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [customerImage, setCustomerImage] = useState<string | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const userId = 'demo-user'; // TODO: Get from auth context

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Restore selected customer from localStorage on mount
  useEffect(() => {
    const savedCustomerId = localStorage.getItem('selectedCustomerId');
    if (savedCustomerId && customers.length > 0) {
      const customer = customers.find(c => c.sys.id === savedCustomerId);
      if (customer) {
        console.log('🔄 Restoring selected customer from localStorage:', savedCustomerId);
        setSelectedCustomer(customer);
      }
    }
  }, [customers]);

  // Save selected customer ID to localStorage whenever it changes
  useEffect(() => {
    if (selectedCustomer) {
      console.log('💾 Saving selected customer to localStorage:', selectedCustomer.sys.id);
      localStorage.setItem('selectedCustomerId', selectedCustomer.sys.id);
    } else {
      localStorage.removeItem('selectedCustomerId');
    }
  }, [selectedCustomer]);

  // Load selections and styling notes when customer changes
  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerData();
    }
  }, [selectedCustomer]);

  // Auto-save selections whenever they change
  useEffect(() => {
    if (selectedCustomer && selectedItems.length > 0) {
      saveSelections();
    }
  }, [selectedItems]);

  // Auto-save styling notes (with debounce)
  useEffect(() => {
    if (!selectedCustomer) return;
    
    const timer = setTimeout(() => {
      if (stylingNotes.trim() !== '') {
        saveSelections();
      }
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timer);
  }, [stylingNotes]);

  const loadCustomerData = async () => {
    if (!selectedCustomer) return;

    try {
      // Load customer image from Contentful
      const imageRef = selectedCustomer.fields?.images?.[0];
      if (imageRef?.sys?.id) {
        const assetResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/assets/${imageRef.sys.id}`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );
        if (assetResponse.ok) {
          const assetData = await assetResponse.json();
          let imageUrl = assetData.fields?.file?.url || '';
          if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
          }
          setCustomerImage(imageUrl);
        }
      }

      // Load saved selections from Supabase
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/selections/get/${selectedCustomer.sys.id}`,
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
      console.error('Error loading customer data:', error);
    }
  };

  const saveSelections = async () => {
    if (!selectedCustomer) return;

    try {
      setIsSaving(true);
      console.log('💾 Saving selections...');

      // Get stylist info (you can hardcode or fetch from a logged-in stylist)
      const stylistName = 'Lissy'; // TODO: Get from logged-in stylist
      const stylistImage = ''; // TODO: Get from logged-in stylist

      const email = getFieldValue(selectedCustomer.fields?.email);
      const name = getFieldValue(selectedCustomer.fields?.name) || email;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/selections/save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            customerId: selectedCustomer.sys.id,
            clientEmail: email,
            clientImage: customerImage,
            clientName: name,
            stylistName,
            stylistImage,
            items: selectedItems.map(item => ({
              id: item.id,
              url: item.url,
              title: item.title || '',
              image: item.image || '',
              price: item.price || '',
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
    if (!selectedCustomer) return;

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
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/sendgrid/send-from-storage/${selectedCustomer.sys.id}`,
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

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Get stylist ID from auth
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        toast.error('Please sign in to continue');
        navigate('/signin');
        return;
      }

      console.log('👨‍💼 Fetching orders for stylist...');

      // Get current user profile to determine stylist ID
      const profileResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/profiles/me`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('❌ Profile fetch failed:', profileResponse.status, errorText);
        
        // If auth error, clear token and redirect to signin
        if (profileResponse.status === 401) {
          console.error('❌ Authentication failed - clearing token and redirecting to signin');
          localStorage.removeItem('access_token');
          localStorage.removeItem('auth_token');
          toast.error('Session expired. Please sign in again.');
          navigate('/signin');
          return;
        }
        
        throw new Error(`Failed to fetch profile: ${profileResponse.status} - ${errorText}`);
      }

      const profileData = await profileResponse.json();
      const stylistId = profileData.profile?.username || 'lissy_roddy'; // Use username as stylist ID
      
      console.log('👨‍💼 Stylist ID:', stylistId);

      // Fetch orders for this stylist
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/stylist/${stylistId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch orders:', errorText);
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      console.log('📋 Orders loaded:', data.orders?.length || 0);
      console.log('📋 Full orders data:', data.orders);
      
      // Map orders to customer format for compatibility
      const ordersAsCustomers = (data.orders || []).map((order: any) => ({
        sys: {
          id: order.id,
          createdAt: order.created_at,
        },
        fields: {
          name: order.customer_name || order.customer_email,
          email: order.customer_email,
          status: order.status,
          mainImage: order.main_image_url,
          referenceImages: order.reference_images || [],
          intakeAnswers: order.intake_answers || {},
        },
      }));

      console.log('📋 Mapped orders:', ordersAsCustomers);
      setCustomers(ordersAsCustomers);
      
      // Auto-select first customer if available
      if (ordersAsCustomers.length > 0) {
        setSelectedCustomer(ordersAsCustomers[0]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
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
                  image: metadata.image || '',  // Set to empty string if no image found
                  price: metadata.price || '',
                }
              : item
          )
        );
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch metadata:', response.status, errorText);
        toast.error('Failed to fetch product details');
        
        // Update item to show it failed
        setSelectedItems(items =>
          items.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  title: 'Product Link',
                  image: '',  // Clear invalid image URL
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error('❌ Error fetching metadata:', error);
      toast.error('Failed to fetch product details');
      
      // Update item to show it failed
      setSelectedItems(items =>
        items.map(item =>
          item.id === itemId
            ? {
                ...item,
                title: 'Product Link',
                image: '',  // Clear invalid image URL
              }
            : item
        )
      );
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

  // If no customer is selected, show customer list
  if (!selectedCustomer) {
    return (
      <div className="w-full min-h-screen overflow-x-hidden bg-white">
        <div className="w-full max-w-[393px] mx-auto relative">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 pt-5 pb-4 border-b border-black/70">
            <div className="flex items-center justify-center px-4 relative">
              <button 
                onClick={() => navigate(-1)}
                className="absolute left-4 w-6 h-6 flex items-center justify-center"
              >
                <ArrowLeft className="w-6 h-6 text-[#1e1709]" strokeWidth={1.5} />
              </button>
              
              <h1 className="font-['Helvetica_Neue:Regular',sans-serif] text-[26px] tracking-[3px] text-black uppercase">
                Seven Selects
              </h1>
            </div>
          </div>

          {/* Customer List */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading customers...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">No customers found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customers.map((customer) => {
                  const email = getFieldValue(customer.fields?.email);
                  const name = getFieldValue(customer.fields?.name) || email;
                  const createdAt = new Date(customer.sys.createdAt).toLocaleDateString();
                  const status = customer.fields?.status || 'waitlist';
                  const mainImage = customer.fields?.mainImage;

                  return (
                    <div
                      key={customer.sys.id}
                      className="w-full p-4 bg-white border border-black/20 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Main Image */}
                        {mainImage && (
                          <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-black/10">
                            <img 
                              src={mainImage} 
                              alt="Style reference" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )
                        }                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-gray-400 mt-1">
                            Submitted: {createdAt}
                          </p>
                          <div className="mt-2">
                            <span className={`inline-block px-3 py-1 rounded-full text-[11px] uppercase tracking-wide font-['Helvetica_Neue:Medium',sans-serif] border ${
                              status === 'waitlist' ? 'bg-white text-black border-black' :
                              status === 'invited' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' :
                              status === 'styling' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              status === 'completed' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                              'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                              {status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-2">
                        {status === 'waitlist' && (
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="flex-1 h-[36px] bg-[#1e1709] text-white rounded-[4px] font-['Helvetica_Neue:Bold',sans-serif] text-[12px] tracking-[0.08em] uppercase hover:bg-[#2a2010] transition-colors"
                          >
                            INVITE
                          </button>
                        )}
                        {status !== 'waitlist' && (
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="flex-1 h-[36px] bg-white border border-[#1e1709] text-[#1e1709] rounded-[4px] font-['Helvetica_Neue:Bold',sans-serif] text-[12px] tracking-[0.08em] uppercase hover:bg-gray-50 transition-colors"
                          >
                            VIEW
                          </button>
                        )}
                      </div>
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

  // If customer is selected, show intake + search + picks
  const email = getFieldValue(selectedCustomer.fields?.email);
  const name = getFieldValue(selectedCustomer.fields?.name) || email;
  const style = getFieldValue(selectedCustomer.fields?.style);
  const occasion = getFieldValue(selectedCustomer.fields?.occasion);
  const budget = getFieldValue(selectedCustomer.fields?.budget);
  const fit = getFieldValue(selectedCustomer.fields?.fit);
  const colors = getFieldValue(selectedCustomer.fields?.colors);
  const phone = getFieldValue(selectedCustomer.fields?.phone);
  const instagram = getFieldValue(selectedCustomer.fields?.instagram);
  const height = getFieldValue(selectedCustomer.fields?.height);
  const size = getFieldValue(selectedCustomer.fields?.size);
  const shoeSize = getFieldValue(selectedCustomer.fields?.shoeSize);
  const additionalNotes = getFieldValue(selectedCustomer.fields?.additionalNotes);
  const images = selectedCustomer.fields?.images;

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-white">
      <div className="w-full max-w-[393px] mx-auto relative pb-8">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 pt-5 pb-4 border-b border-black/70">
          <div className="flex items-center justify-center px-4 relative">
            <button 
              onClick={() => setSelectedCustomer(null)}
              className="absolute left-4 w-6 h-6 flex items-center justify-center"
            >
              <ArrowLeft className="w-6 h-6 text-[#1e1709]" strokeWidth={1.5} />
            </button>
            
            <h1 className="font-['Helvetica_Neue:Regular',sans-serif] text-[26px] tracking-[3px] text-black uppercase">
              Seven Selects
            </h1>
          </div>
        </div>

        {/* Client Information */}
        <div className="px-4 pt-6">
          <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[20px] tracking-[2px] text-[#1e1709] uppercase mb-4">
            Client
          </h2>
          
          {/* Client Image */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-full max-w-[280px]">
              <div className="w-full aspect-[3/4] border border-black rounded-[16px] overflow-hidden bg-white">
                {/* Placeholder avatar - you can replace with actual client photo if available */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <span className="font-['Helvetica_Neue:Bold',sans-serif] text-[48px] text-gray-500">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Intake Answers */}
          <div className="mb-6">
            <h3 className="font-['Helvetica_Neue:Medium',sans-serif] text-[16px] tracking-[1.5px] text-[#1e1709] uppercase mb-3">
              Intake Answers
            </h3>
            <div className="space-y-4 bg-gray-50 rounded-lg p-4 border border-black/10">
              {email && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] text-gray-500 uppercase">Email</p>
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] mt-1">{email}</p>
                </div>
              )}
              {phone && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] text-gray-500 uppercase">Phone</p>
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] mt-1">{phone}</p>
                </div>
              )}
              {instagram && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] text-gray-500 uppercase">Instagram</p>
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] mt-1">{instagram}</p>
                </div>
              )}
              {height && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] text-gray-500 uppercase">Height</p>
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] mt-1">{height}</p>
                </div>
              )}
              {size && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] text-gray-500 uppercase">Size</p>
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] mt-1">{size}</p>
                </div>
              )}
              {shoeSize && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] text-gray-500 uppercase">Shoe Size</p>
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] mt-1">{shoeSize}</p>
                </div>
              )}
              {style && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] text-gray-500 uppercase">Style</p>
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] mt-1">{style}</p>
                </div>
              )}
              {occasion && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] text-gray-500 uppercase">Occasion</p>
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] mt-1">{occasion}</p>
                </div>
              )}
              {budget && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] text-gray-500 uppercase">Budget</p>
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] mt-1">{budget}</p>
                </div>
              )}
              {fit && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] text-gray-500 uppercase">Fit Preference</p>
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] mt-1">{fit}</p>
                </div>
              )}
              {colors && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] text-gray-500 uppercase">Colors</p>
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] mt-1">{colors}</p>
                </div>
              )}
              {additionalNotes && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] text-gray-500 uppercase">Additional Notes</p>
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] mt-1">{additionalNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Reference Images */}
          {images && Array.isArray(images) && images.length > 0 && (
            <div>
              <h3 className="font-['Helvetica_Neue:Medium',sans-serif] text-[16px] tracking-[1.5px] text-[#1e1709] uppercase mb-3">
                Reference Images
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {images.map((img: any, idx: number) => {
                  const imageUrl = img?.fields?.file?.url || img?.url;
                  if (!imageUrl) return null;
                  const fullUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;
                  return (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-black">
                      <img 
                        src={fullUrl} 
                        alt={`Reference ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                })}
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

        {/* Search Section */}
        <div className="mt-8 px-4">
          <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[20px] tracking-[2px] text-[#1e1709] uppercase mb-4">
            Curate
          </h2>
          
          <div className="border border-black/20 rounded-lg overflow-hidden">
            <GPTSearchPanel 
              onAddItem={addItem}
              selectedCustomer={selectedCustomer}
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

        {/* Selected Items */}
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
              <span>Send Email</span>
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