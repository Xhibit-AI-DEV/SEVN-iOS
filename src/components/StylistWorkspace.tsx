import { useState, useEffect } from 'react';
import { CustomerIntakePanel } from './CustomerIntakePanel';
import { GPTSearchPanel } from './GPTSearchPanel';
import { SelectionsPanel } from './SelectionsPanel';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'react-toastify';

interface Customer {
  sys: {
    id: string;
    createdAt: string;
  };
  fields: any;
}

interface StylistWorkspaceProps {
  customer: Customer;
}

export interface SelectedItem {
  id: string;
  url: string;
  source: 'manual' | 'voice';
  timestamp: string;
  title?: string;
  image?: string;
  description?: string;
  price?: string;
}

export interface ProductData {
  productUrl: string;
  productName?: string;
  brand?: string;
  price?: string;
  imageUrl?: string;
}

export function StylistWorkspace({ customer }: StylistWorkspaceProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isLoadingSelections, setIsLoadingSelections] = useState(false);

  // Load selections from backend when customer changes
  useEffect(() => {
    if (customer?.sys?.id) {
      loadSelectionsFromBackend();
    }
  }, [customer?.sys?.id]);

  // Save selections to backend whenever they change
  useEffect(() => {
    if (selectedItems.length > 0 || isLoadingSelections) {
      saveSelectionsToBackend();
    }
  }, [selectedItems]);

  const loadSelectionsFromBackend = async () => {
    try {
      setIsLoadingSelections(true);
      console.log('📥 Loading selections for customer:', customer.sys.id);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/selections/get/${customer.sys.id}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.items) {
          console.log('✅ Loaded selections from backend:', data.data.items.length);
          setSelectedItems(data.data.items);
        } else {
          console.log('📭 No selections found in backend');
          setSelectedItems([]);
        }
      }
    } catch (error) {
      console.error('Error loading selections from backend:', error);
    } finally {
      setIsLoadingSelections(false);
    }
  };

  const saveSelectionsToBackend = async () => {
    try {
      console.log('💾 Saving selections to backend:', selectedItems.length);

      // Helper function to safely extract field values
      const getFieldValue = (value: any): string => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'number' || typeof value === 'boolean') return String(value);
        return '';
      };

      // Extract client information from Contentful
      const clientEmail = customer.fields?.email;
      const clientName = getFieldValue(customer.fields?.name || customer.fields?.firstName);
      
      // Extract styling intake (could be various fields from Contentful)
      const clientStylingIntake = {
        stylePreferences: customer.fields?.stylePreferences || '',
        sizeInfo: customer.fields?.sizeInfo || customer.fields?.size || '',
        budget: customer.fields?.budget || '',
        occasion: customer.fields?.occasion || '',
        colors: customer.fields?.colors || customer.fields?.colorPreferences || '',
        // Include all intake fields from Contentful
        rawIntakeData: customer.fields || {},
      };

      // Get assigned stylist ID from Contentful (if there's a stylist field)
      const assignedStylistId = customer.fields?.stylist?.sys?.id || '';
      
      // Get client image from Contentful
      let clientImage = '';
      const customerImageId = customer.fields?.image?.sys?.id;
      if (customerImageId) {
        try {
          const assetResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/assets/${customerImageId}`,
            {
              headers: {
                Authorization: `Bearer ${publicAnonKey}`,
              },
            }
          );
          if (assetResponse.ok) {
            const assetData = await assetResponse.json();
            clientImage = assetData.fields?.file?.url || '';
            if (clientImage.startsWith('//')) {
              clientImage = 'https:' + clientImage;
            }
          }
        } catch (error) {
          console.error('Error fetching client image:', error);
        }
      }

      // Get stylist information from Contentful if assigned
      let stylistName = '';
      let stylistImage = '';

      if (assignedStylistId) {
        try {
          // Fetch stylist data from Contentful
          const stylistResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/stylists/${assignedStylistId}`,
            {
              headers: {
                Authorization: `Bearer ${publicAnonKey}`,
              },
            }
          );
          
          if (stylistResponse.ok) {
            const stylistData = await stylistResponse.json();
            stylistName = stylistData.fields?.fullname || '';
            
            // Get stylist image
            const stylistImageId = stylistData.fields?.profile_picture?.sys?.id;
            if (stylistImageId) {
              const stylistAssetResponse = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/assets/${stylistImageId}`,
                {
                  headers: {
                    Authorization: `Bearer ${publicAnonKey}`,
                  },
                }
              );
              if (stylistAssetResponse.ok) {
                const stylistAssetData = await stylistAssetResponse.json();
                stylistImage = stylistAssetData.fields?.file?.url || '';
                if (stylistImage.startsWith('//')) {
                  stylistImage = 'https:' + stylistImage;
                }
              }
            }
          }
        } catch (error) {
          console.error('Error fetching stylist data:', error);
        }
      }

      console.log('💾 Client data to save:', {
        clientEmail,
        clientName,
        assignedStylistId,
        stylistName,
      });

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/selections/save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            customerId: customer.sys.id,
            // Client information from Contentful
            clientEmail,
            clientImage,
            clientStylingIntake,
            assignedStylistId,
            clientName,
            // Stylist information
            stylistName,
            stylistImage,
            // Items with product name, price, product URL
            items: selectedItems.map(item => ({
              id: item.id,
              url: item.url,
              title: item.title || '',
              image: item.image || '',
              price: item.price || '',
              source: item.source,
              timestamp: item.timestamp,
            })),
            stylingNotes: '',
          }),
        }
      );

      if (response.ok) {
        console.log('✅ Selections saved to backend');
      } else {
        console.error('❌ Failed to save selections to backend');
      }
    } catch (error) {
      console.error('Error saving selections to backend:', error);
    }
  };

  const addItem = async (urlOrProduct: string | ProductData, source: 'manual' | 'voice') => {
    if (selectedItems.length >= 7) {
      return;
    }

    console.log('🔵 ADD ITEM CALLED');
    console.log('Input:', urlOrProduct);
    console.log('Source:', source);

    // Extract URL and metadata
    const url = typeof urlOrProduct === 'string' ? urlOrProduct : urlOrProduct.productUrl;
    const hasPreloadedData = typeof urlOrProduct === 'object';

    // Detect Google Shopping URLs (they don't have scrapable metadata)
    if (!hasPreloadedData && url.includes('google.com') && (url.includes('shopping') || url.includes('udm=28') || url.includes('ibp=oshop'))) {
      toast.error('⚠️ Google Shopping links don\'t work - Please paste the actual product page URL (e.g., pacsun.com, zara.com, etc.)');
      return;
    }

    // Create item with basic info first
    const newItem: SelectedItem = {
      id: `${Date.now()}-${Math.random()}`,
      url,
      source,
      timestamp: new Date().toISOString(),
      // If we have preloaded data from AI, use it immediately
      ...(hasPreloadedData && {
        title: urlOrProduct.productName || undefined,
        image: urlOrProduct.imageUrl || undefined,
        price: urlOrProduct.price || undefined,
      }),
    };

    console.log('🔵 NEW ITEM CREATED:', newItem);
    console.log('🔵 Has preloaded image?:', !!newItem.image);

    // Add to list immediately
    setSelectedItems([...selectedItems, newItem]);

    console.log('🔵 ITEM ADDED TO STATE');

    // Only fetch metadata if we don't have preloaded data
    if (!hasPreloadedData) {
      // Fetch metadata in the background
      try {
        console.log('🔵 Fetching metadata for URL:', url);
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

        console.log('🔵 Metadata response status:', response.status);

        if (response.ok) {
          const metadata = await response.json();
          console.log('🔵 ✅ METADATA RECEIVED:', metadata);
          console.log('🔵 Image URL:', metadata.image);
          console.log('🔵 Title:', metadata.title);
          console.log('🔵 Price:', metadata.price);
          console.log('🔵 Has image?:', !!metadata.image);
          console.log('🔵 Image value:', metadata.image);
          
          // Update the item with metadata - preserve original URL
          setSelectedItems(items => {
            console.log('🔵 UPDATING ITEMS. Current items:', items);
            const updated = items.map(item => {
              if (item.id === newItem.id) {
                const updatedItem = { 
                  ...item, 
                  title: metadata.title,
                  image: metadata.image,
                  description: metadata.description,
                  price: metadata.price,
                };
                console.log('🔵 ✅ ITEM UPDATED WITH IMAGE:', updatedItem);
                console.log('🔵 Updated item.image value:', updatedItem.image);
                return updatedItem;
              }
              return item;
            });
            console.log('🔵 ALL ITEMS AFTER UPDATE:', updated);
            return updated;
          });
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    } else {
      console.log('🔵 ✅ SKIPPING METADATA FETCH - Using preloaded data from AI');
    }
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  return (
    <div className="h-full flex bg-gray-950">
      {/* Left Panel: Customer Intake + GPT Search */}
      <div className="flex-1 min-w-0">
        <div className="h-full flex flex-col">
          {/* Customer Intake */}
          <div className="h-[40%] min-h-[200px] border-b border-gray-800 flex-shrink-0">
            <CustomerIntakePanel customer={customer} />
          </div>

          {/* GPT Search */}
          <div className="flex-1 min-h-0">
            <GPTSearchPanel 
              onAddItem={(url) => addItem(url, 'voice')} 
              selectedCustomer={customer}
              selectedItems={selectedItems}
              onRemoveItem={removeItem}
            />
          </div>
        </div>
      </div>

      {/* Right Panel: Selections - Fixed 150px width */}
      <div className="w-[110px] border-l border-gray-800 flex-shrink-0 overflow-hidden">
        <SelectionsPanel
          customer={customer}
          selectedItems={selectedItems}
          onAddItem={(url) => addItem(url, 'manual')}
          onRemoveItem={removeItem}
        />
      </div>
    </div>
  );
}