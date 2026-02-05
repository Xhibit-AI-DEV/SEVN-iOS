import { User } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Customer {
  sys: {
    id: string;
    createdAt: string;
  };
  fields: any;
}

interface CustomerListProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  loading: boolean;
  error: string | null;
}

// Helper function to safely extract string values from Contentful fields
const getFieldValue = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  
  // Handle Contentful Rich Text
  if (typeof value === 'object' && value.nodeType && value.content) {
    return extractTextFromRichText(value);
  }
  
  return '';
};

const extractTextFromRichText = (node: any): string => {
  if (!node) return '';
  
  if (node.nodeType === 'text') {
    return node.value || '';
  }
  
  if (node.content && Array.isArray(node.content)) {
    return node.content
      .map((child: any) => extractTextFromRichText(child))
      .filter((text: string) => text.length > 0)
      .join(' ');
  }
  
  return '';
};

export function CustomerList({ customers, selectedCustomer, onSelectCustomer, loading, error }: CustomerListProps) {
  const [customerImages, setCustomerImages] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load first image for each customer
    loadCustomerImages();
  }, [customers]);

  const loadCustomerImages = async () => {
    const imageMap: Record<string, string> = {};

    for (const customer of customers) {
      const fields = customer.fields || {};
      if (fields.images && Array.isArray(fields.images) && fields.images.length > 0) {
        const firstImageRef = fields.images[0];
        const assetId = firstImageRef.sys?.id;
        
        if (assetId) {
          try {
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/assets/${assetId}`,
              {
                headers: {
                  Authorization: `Bearer ${publicAnonKey}`,
                },
              }
            );

            if (response.ok) {
              const assetData = await response.json();
              const url = assetData.fields?.file?.url;
              if (url) {
                imageMap[customer.sys.id] = url.startsWith('//') ? `https:${url}` : url;
              }
            }
          } catch (error) {
            console.error(`Error loading image for customer ${customer.sys.id}:`, error);
          }
        }
      }
    }

    setCustomerImages(imageMap);
  };

  return (
    <div className="h-full flex flex-col bg-black" style={{ width: '60px' }}>
      <div className="px-1 py-2 border-b border-gray-800 flex-shrink-0">
        <h2 className="text-white tracking-wide text-xs text-center">CLIENTS</h2>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
        </div>
      )}

      {error && (
        <div className="p-1">
          <div className="p-2 bg-red-950 border border-red-800 rounded-lg">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="py-2 space-y-3 flex flex-col items-center w-full" style={{ paddingLeft: '14px', paddingRight: '14px' }}>
            {customers.map((customer) => {
              const imageUrl = customerImages[customer.sys.id];
              
              return (
                <button
                  key={customer.sys.id}
                  onClick={() => onSelectCustomer(customer)}
                  className={`transition-all rounded-full flex-shrink-0 ${
                    selectedCustomer?.sys.id === customer.sys.id
                      ? 'opacity-100'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* Customer Image Circle */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={customer.fields.name || 'Customer'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}