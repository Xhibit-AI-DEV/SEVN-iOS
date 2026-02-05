import { useState, useEffect } from 'react';
import { Loader2, ImageIcon } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Customer {
  sys: {
    id: string;
    createdAt: string;
  };
  fields: any;
}

interface CustomerIntakePanelProps {
  customer: Customer;
}

export function CustomerIntakePanel({ customer }: CustomerIntakePanelProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    // Extract and load image URLs from customer data
    loadCustomerImages();
  }, [customer]);

  const loadCustomerImages = async () => {
    const fields = customer.fields || {};
    const imageAssets: string[] = [];

    // Look for image references in customer fields
    // This will depend on your Contentful structure
    if (fields.images && Array.isArray(fields.images)) {
      setLoadingImages(true);
      try {
        for (const imageRef of fields.images) {
          const assetId = imageRef.sys?.id;
          if (assetId) {
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
                imageAssets.push(url.startsWith('//') ? `https:${url}` : url);
              }
            }
          }
        }
        setImageUrls(imageAssets);
      } catch (error) {
        console.error('Error loading customer images:', error);
      } finally {
        setLoadingImages(false);
      }
    }
  };

  const renderFieldValue = (value: any): string => {
    try {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'number' || typeof value === 'boolean') return String(value);
      
      // Handle arrays - check if items are primitives or objects
      if (Array.isArray(value)) {
        const filtered = value
          .map(item => {
            if (item === null || item === undefined) return '';
            if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
              return String(item);
            }
            // Skip objects in arrays
            return '';
          })
          .filter(Boolean);
        return filtered.join(', ');
      }
      
      // Handle Contentful Rich Text objects
      if (typeof value === 'object' && value !== null) {
        // Check if it's a Contentful Rich Text document
        if (value.nodeType && value.content) {
          const extracted = extractTextFromRichText(value);
          return typeof extracted === 'string' ? extracted : '';
        }
        // Skip other complex objects
        return '';
      }
      
      return '';
    } catch (error) {
      console.error('Error rendering field value:', error);
      return '';
    }
  };

  const extractTextFromRichText = (node: any): string => {
    if (!node) return '';

    // If it's a text node, return the value
    if (node.nodeType === 'text') {
      return node.value || '';
    }

    // If it has content, recursively extract text from children
    if (node.content && Array.isArray(node.content)) {
      return node.content
        .map((child: any) => extractTextFromRichText(child))
        .filter((text: string) => text.length > 0)
        .join(' ');
    }

    return '';
  };

  return (
    <div className="h-full overflow-y-auto bg-black border-r border-gray-800">
      <div className="p-6 pt-4">
        {loadingImages ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : imageUrls.length > 0 ? (
          <div className="flex gap-4">
            {/* Customer Fields - Left Side */}
            <div className="flex-1 space-y-3">
              {Object.entries(customer.fields || {}).map(([key, value]) => {
                // Skip internal fields and references that are objects (except rich text)
                if (key === 'images') return null;
                
                // Try to render the value
                const renderedValue = renderFieldValue(value);
                
                // Strict type check - only render if it's a non-empty string
                if (typeof renderedValue !== 'string' || renderedValue.trim().length === 0) {
                  return null;
                }

                return (
                  <div key={key}>
                    <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <p className="text-white text-xs whitespace-pre-wrap">{renderedValue}</p>
                  </div>
                );
              })}
            </div>

            {/* Customer Images - Right Side */}
            <div className="flex-shrink-0 w-48">
              <div className="space-y-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={url}
                      alt={`Customer upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(customer.fields || {}).map(([key, value]) => {
              // Skip internal fields
              if (key === 'images') return null;
              
              // Try to render the value
              const renderedValue = renderFieldValue(value);
              
              // Strict type check - only render if it's a non-empty string
              if (typeof renderedValue !== 'string' || renderedValue.trim().length === 0) {
                return null;
              }

              return (
                <div key={key}>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <p className="text-white text-xs whitespace-pre-wrap">{renderedValue}</p>
                </div>
              );
            })}
          </div>
        )}

        {Object.keys(customer.fields || {}).length === 0 && (
          <p className="text-gray-500 text-center py-8">No intake data available</p>
        )}
      </div>
    </div>
  );
}