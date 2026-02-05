import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Loader2, Sparkles, Search, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';
import assistantAvatar from 'figma:asset/4784cb3399669455540e0655ffb1af7717d38875.png';
import userAvatar from 'figma:asset/c45610e67380b95476b31093b81c9f9dd581be7d.png';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Message {
  role: 'user' | 'assistant' | 'function' | 'products';
  content: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  name?: string;
  products?: ProductTile[];
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchResults, setLastSearchResults] = useState<ProductTile[]>([]);
  const [isSmartSuggesting, setIsSmartSuggesting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation history when customer is selected
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!selectedCustomer?.sys?.id) {
        setMessages([]);
        return;
      }

      setIsLoadingHistory(true);
      try {
        const conversationId = selectedCustomer.sys.id;
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/openai/conversation/${conversationId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load conversation history');
        }

        const data = await response.json();
        
        // Filter out system messages and only show user/assistant messages
        const filteredMessages = data.messages.filter(
          (msg: Message) => msg.role === 'user' || msg.role === 'assistant'
        );
        
        setMessages(filteredMessages);
        
        if (filteredMessages.length > 0) {
          console.log(`✅ Loaded ${filteredMessages.length} messages for customer ${conversationId}`);
        }
      } catch (error: any) {
        console.error('Error loading conversation history:', error);
        // Don't show error toast, just start with empty conversation
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadConversationHistory();
  }, [selectedCustomer?.sys?.id]);

  // Helper to safely render Contentful field values
  const getFieldValue = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) {
      return value
        .map(item => {
          if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
            return String(item);
          }
          return '';
        })
        .filter(Boolean)
        .join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      // Handle Contentful Rich Text
      if (value.nodeType && value.content) {
        return extractTextFromRichText(value);
      }
      return '';
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const messageText = inputMessage.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let customerContext = null;
      if (selectedCustomer) {
        customerContext = {
          email: getFieldValue(selectedCustomer.fields?.email),
          intakeData: selectedCustomer.fields,
        };
      }

      const conversationId = selectedCustomer?.sys?.id || 'general';

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/openai/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            customerContext,
            conversationId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from GPT');
      }

      const data = await response.json();
      
      if (data.functionCall) {
        const functionCall = data.functionCall;
        const functionName = functionCall.name;
        const functionArgs = JSON.parse(functionCall.arguments);

        if (functionName === 'add_to_library') {
          await handleAddToLibrary(functionArgs);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `✅ Added ${functionArgs.productName} by ${functionArgs.brand} to library`,
          }]);
        } else if (functionName === 'add_to_selects') {
          await handleAddToSelects(functionArgs);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `✅ Added ${functionArgs.productName} to this customer's selects`,
          }]);
        }
      } else {
        setMessages(prev => [...prev, data.message]);

        const urlRegex = /(https?:\/\/[^\s\)]+)/g;
        const urls = data.message.content.match(urlRegex);
        
        if (urls && urls.length > 0) {
          toast.success(`Found ${urls.length} product link(s) in response`);
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      let errorMessage = '❌ Sorry, I encountered an error.';
      let toastMessage = error.message || 'Failed to send message';
      
      if (error.message.includes('API key not configured')) {
        errorMessage = '🔑 OpenAI API key not configured.\n\nPlease add your OpenAI API key in the secrets panel.';
        toastMessage = 'API key not configured';
      } else if (error.message.includes('Rate limit')) {
        errorMessage = '⏱️ Rate limit exceeded.\n\nYour OpenAI account hit its request limit. Wait 60 seconds or upgrade your plan at platform.openai.com/settings/organization/billing';
        toastMessage = 'Rate limit - wait 60 seconds';
      }
      
      toast.error(toastMessage);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToLibrary = async (args: any) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/openai/add-to-library`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(args),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add to library');
      }

      const data = await response.json();
      toast.success(`📚 ${data.message}`);
    } catch (error: any) {
      console.error('Error adding to library:', error);
      toast.error('Failed to add to library');
    }
  };

  const handleAddToSelects = async (args: any) => {
    try {
      console.log('🟢 ADD TO SELECTS - Full args:', args);
      // Pass the full product data to onAddItem
      onAddItem({
        productUrl: args.productUrl,
        productName: args.productName,
        brand: args.brand,
        price: args.price,
        imageUrl: args.imageUrl,
      });
      toast.success(`✅ Added ${args.productName} to selects`);
    } catch (error: any) {
      console.error('Error adding to selects:', error);
      toast.error('Failed to add to selects');
    }
  };

  const extractAndAddUrls = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
    const urls = content.match(urlRegex);
    
    if (urls) {
      urls.forEach(url => {
        onAddItem(url);
      });
      toast.success(`Added ${urls.length} item(s) from GPT response`);
    } else {
      toast.error('No URLs found in this message');
    }
  };

  // Search for products using shopping API
  const searchProducts = async (queryOverride?: string) => {
    const query = (queryOverride || inputMessage || '').trim();
    if (!query || isLoading) return;

    setInputMessage('');
    setIsLoading(true);

    setMessages(prev => [...prev, {
      role: 'user',
      content: `🔍 Search: ${query}`,
    }]);

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
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message || data.error,
        }]);
        
        if (data.setupUrl) {
          toast.error('Product search not configured - see chat for setup');
        } else {
          toast.error(data.error);
        }
        return;
      }

      if (data.products && data.products.length > 0) {
        setMessages(prev => [...prev, {
          role: 'products',
          content: `Found ${data.products.length} products for "${query}" via ${data.searchInfo?.searchEngine || 'web search'}`,
          products: data.products,
        }]);
        toast.success(`Found ${data.products.length} products!`);
        setLastSearchResults(data.products);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `No products found for "${query}". Try different keywords or brands.`,
        }]);
        toast.info('No products found');
      }
    } catch (error: any) {
      console.error('Error searching products:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Search error: ${error.message}`,
      }]);
      toast.error('Failed to search products');
    } finally {
      setIsLoading(false);
    }
  };

  // Smart Suggest - AI-powered capsule generation
  const handleSmartSuggest = async () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer first');
      return;
    }

    if (isSmartSuggesting) return;

    const customerId = selectedCustomer.sys?.id;
    if (!customerId) {
      toast.error('Customer ID not found');
      return;
    }

    setIsSmartSuggesting(true);
    setMessages(prev => [...prev, {
      role: 'user',
      content: '✨ Generate smart suggestions for this customer',
    }]);

    try {
      console.log('💡 Requesting smart suggestions for customer:', customerId);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/personalized-search/smart-suggest/${customerId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate suggestions');
      }

      const data = await response.json();
      console.log('💡 Smart suggest response:', data);

      if (data.suggestions && data.suggestions.length > 0) {
        setMessages(prev => [...prev, {
          role: 'products',
          content: `✨ Generated ${data.suggestions.length} personalized items based on customer intake, style, and Lissy's curation patterns`,
          products: data.suggestions.map((s: any) => ({
            name: s.name,
            brand: s.brand,
            price: s.price,
            url: s.link,
            imageUrl: s.imageUrl,
            source: s.source,
          })),
        }]);
        setLastSearchResults(data.suggestions.map((s: any) => ({
          name: s.name,
          brand: s.brand,
          price: s.price,
          url: s.link,
          imageUrl: s.imageUrl,
          source: s.source,
        })));
        toast.success(`✨ Generated ${data.suggestions.length} smart suggestions!`);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '❌ No suggestions could be generated. Make sure the customer has intake data and images.',
        }]);
        toast.error('No suggestions generated');
      }
    } catch (error: any) {
      console.error('Error generating smart suggestions:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Smart suggest error: ${error.message}`,
      }]);
      toast.error(error.message || 'Failed to generate suggestions');
    } finally {
      setIsSmartSuggesting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-2 bg-white text-black border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <h2 className="tracking-wider font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] uppercase">SEVN</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-3 bg-white">
        {messages.map((message, index) => (
          <div key={index}>
            {/* Regular message display */}
            {message.role !== 'products' && (
              <div
                className={`flex gap-2 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img src={assistantAvatar} alt="Assistant" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  
                  {message.role === 'assistant' && message.content.match(/(https?:\/\/[^\s\)]+)/g) && (
                    <button
                      onClick={() => extractAndAddUrls(message.content)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-700 underline"
                    >
                      + Add all links from this message
                    </button>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            {/* Product tiles display */}
            {message.role === 'products' && message.products && (
              <div className="w-full">
                <p className="text-sm text-gray-600 mb-2">{message.content}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {message.products.slice(0, 20).map((product, pIndex) => (
                    <div
                      key={pIndex}
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
                            console.log('🟢 BLUE BUTTON CLICKED');
                            console.log('🟢 Product object:', product);
                            const productUrl = product.url || product.link;
                            console.log('🟢 Product URL:', productUrl);
                            console.log('🟢 Product name:', product.name);
                            console.log('🟢 Product imageUrl:', product.imageUrl);
                            // Pass the full product object, not just the URL
                            onAddItem({
                              productUrl: productUrl,
                              productName: product.name,
                              brand: product.brand,
                              price: product.price,
                              imageUrl: product.imageUrl,
                            });
                            toast.success(`Added ${product.name}`);
                          }}
                          className="absolute top-1 right-1 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Product Info */}
                      <a
                        href={product.url || product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2"
                      >
                        {product.brand && (
                          <p className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5">
                            {product.brand}
                          </p>
                        )}
                        <h3 className="text-xs line-clamp-2 mb-1 leading-tight">
                          {product.name}
                        </h3>
                        {product.price && (
                          <p className="text-xs text-gray-900">
                            {product.price}
                          </p>
                        )}
                        {product.source && (
                          <p className="text-[8px] text-gray-400 mt-0.5">
                            {product.source}
                          </p>
                        )}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src={assistantAvatar} alt="Assistant" className="w-full h-full object-cover" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-200 flex-shrink-0">
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
            className="flex-1 text-sm border-gray-700 text-gray-900 h-9"
            style={{ backgroundColor: '#E2DFDD !important' } as any}
          />
          <Button
            onClick={() => searchProducts()}
            disabled={isLoading || !inputMessage.trim()}
            size="sm"
            variant="ghost"
            className="gap-1 h-9 text-xs text-gray-900"
            style={{ backgroundColor: '#E2DFDD', color: '#000' }}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Search className="h-3 w-3" />
                Search
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}