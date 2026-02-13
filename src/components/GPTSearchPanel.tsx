import { useState } from 'react';
import { Loader2, Search, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ProductTile {
  name: string;
  brand?: string;
  price?: string;
  url: string;
  imageUrl?: string;
  source?: string;
}

interface ProductData {
  productUrl: string;
  productName?: string;
  brand?: string;
  price?: string;
  imageUrl?: string;
}

interface GPTSearchPanelProps {
  onAddItem: (urlOrProduct: string | ProductData) => void;
  selectedCustomer?: any;
  selectedItems?: Array<{
    id: string;
    title?: string;
    url: string;
  }>;
  onRemoveItem?: (id: string) => void;
}

export function GPTSearchPanel({ onAddItem, selectedCustomer, selectedItems = [], onRemoveItem }: GPTSearchPanelProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<ProductTile[]>([]);
  const [externalLink, setExternalLink] = useState('');
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

  // Search for products using shopping API
  const searchProducts = async (queryOverride?: string) => {
    const query = (queryOverride || inputMessage || '').trim();
    if (!query || isLoading) return;

    setInputMessage('');
    setIsLoading(true);

    try {
      // Use Serper API (Google Shopping - Best for real fashion products with pricing)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/serper-search/search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ query, num: 12 }),
        }
      );

      const data = await response.json();

      if (data.error) {
        if (data.setupUrl) {
          toast.error('Product search not configured - see setup instructions');
        } else {
          toast.error(data.error);
        }
        setSearchResults([]);
        return;
      }

      if (data.products && data.products.length > 0) {
        setSearchResults(data.products);
        toast.success(`Found ${data.products.length} products!`);
      } else {
        setSearchResults([]);
        toast.info('No products found');
      }
    } catch (error: any) {
      console.error('Error searching products:', error);
      toast.error('Failed to search products');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add external link with metadata fetching
  const handleAddExternalLink = async () => {
    if (!externalLink.trim()) return;

    // Normalize URL - add https:// if not present
    let normalizedUrl = externalLink.trim();
    
    // Add protocol if missing
    if (!normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    
    // Remove trailing slash
    normalizedUrl = normalizedUrl.replace(/\/$/, '');
    
    // Validate it's a real URL format
    try {
      new URL(normalizedUrl);
      
      // Must have a valid domain
      const urlObj = new URL(normalizedUrl);
      if (!urlObj.hostname.includes('.')) {
        toast.error('Please enter a valid URL');
        return;
      }
    } catch (e) {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsFetchingMetadata(true);
    
    try {
      // Fetch metadata for the product link
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/fetch-url-metadata`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ url: normalizedUrl }),
        }
      );

      const data = await response.json();
      
      console.log('📦 External link metadata:', data);
      console.log('📦 Metadata details:', {
        url: data.url,
        title: data.title,
        image: data.image,
        hasImage: !!data.image,
        error: data.error
      });
      
      // Add the link with metadata
      onAddItem({
        productUrl: data.url || normalizedUrl,
        productName: data.title || 'Product Link',
        imageUrl: data.image || undefined,
      });
      
      setExternalLink('');
      toast.success('Added external link');
    } catch (error) {
      console.error('Error fetching link metadata:', error);
      // Still add the link even if metadata fetch fails
      onAddItem({
        productUrl: normalizedUrl,
        productName: 'Product Link',
      });
      setExternalLink('');
      toast.success('Added external link');
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 flex-shrink-0">
        <h2 className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[1px] uppercase text-[#1e1709]">
          SEVN SELECTS
        </h2>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            placeholder=""
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                searchProducts();
              }
            }}
            disabled={isLoading}
            className="flex-1 text-sm border-gray-300 text-gray-900 h-10 rounded-md"
          />
          <Button
            onClick={() => searchProducts()}
            disabled={isLoading || !inputMessage.trim()}
            size="sm"
            variant="ghost"
            className="gap-1 h-10 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>
      </div>

      {/* External Link Input */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <p className="text-xs text-gray-600 mb-2 font-['Helvetica_Neue:Regular',sans-serif]">
          Add external link
        </p>
        <div className="flex gap-2 items-center">
          <Input
            type="url"
            placeholder="https://..."
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddExternalLink();
              }
            }}
            disabled={isFetchingMetadata}
            className="flex-1 text-sm border-gray-300 text-gray-900 h-10 rounded-md"
          />
          <Button
            onClick={handleAddExternalLink}
            disabled={isFetchingMetadata || !externalLink.trim()}
            size="sm"
            className="gap-1 h-10 text-sm bg-[#1e1709] hover:bg-[#1e1709]/80 text-white"
          >
            {isFetchingMetadata ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 bg-white">
        {searchResults.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">
              Search for products to add to your selections
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {searchResults.map((product, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow group cursor-pointer"
              >
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Add button overlay */}
                  <button
                    onClick={() => {
                      console.log('🟢 Add button clicked for:', product.name);
                      const productUrl = product.url;
                      onAddItem({
                        productUrl: productUrl,
                        productName: product.name,
                        brand: product.brand,
                        price: product.price,
                        imageUrl: product.imageUrl,
                      });
                      toast.success(`Added ${product.name}`);
                    }}
                    className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Product Info */}
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3"
                >
                  {product.brand && (
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                      {product.brand}
                    </p>
                  )}
                  <h3 className="text-xs line-clamp-2 mb-1 leading-tight text-gray-900">
                    {product.name}
                  </h3>
                  {product.price && (
                    <p className="text-sm font-semibold text-[#1e1709]">
                      {product.price}
                    </p>
                  )}
                  {product.source && (
                    <p className="text-[9px] text-gray-400 mt-1">
                      {product.source}
                    </p>
                  )}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}