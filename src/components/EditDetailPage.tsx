import { useNavigate, useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import svgPaths from "../imports/svg-ib8s7izy1q";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { ProductLinkModal } from './ProductLinkModal';

export function EditDetailPage() {
  const navigate = useNavigate();
  const { editId } = useParams<{ editId: string }>();
  const [edit, setEdit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [isEditLiked, setIsEditLiked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedProductUrl, setSelectedProductUrl] = useState<string | null>(null);
  const [selectedProductTitle, setSelectedProductTitle] = useState<string | null>(null);

  useEffect(() => {
    const loadEditData = async () => {
      try {
        // Get user ID and access token
        const accessToken = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
        if (accessToken) {
          const authResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/auth/me`,
            {
              headers: { 'Authorization': `Bearer ${accessToken}` },
            }
          );
          
          if (authResponse.ok) {
            const authData = await authResponse.json();
            setUserId(authData.user_id);
          }
        }

        // Fetch edit data - use access token if available, otherwise use public key
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/edits/${editId}`,
          {
            headers: { 'Authorization': `Bearer ${accessToken || publicAnonKey}` },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load edit');
        }

        const data = await response.json();
        setEdit(data.edit);
        setIsEditLiked(data.edit.is_liked || false);
      } catch (error) {
        console.error('Error loading edit:', error);
        toast.error('Failed to load edit');
      } finally {
        setIsLoading(false);
      }
    };

    loadEditData();
  }, [editId]);

  const handleLikeProduct = async (productUrl: string, productData: any) => {
    if (!userId) {
      toast.error('Please sign in to like products');
      return;
    }

    try {
      const accessToken = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/likes/like`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            userId,
            productId: productUrl,
            productData: {
              title: productData.title || 'Product',
              image: productData.image,
              url: productUrl,
            },
          }),
        }
      );

      if (response.ok) {
        setLikedProducts(new Set([...likedProducts, productUrl]));
        toast.success('Added to likes!');
      }
    } catch (error) {
      console.error('Error liking product:', error);
      toast.error('Failed to like product');
    }
  };

  const handleUnlikeProduct = async (productUrl: string) => {
    if (!userId) return;

    try {
      const accessToken = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/likes/unlike`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ userId, productId: productUrl }),
        }
      );

      if (response.ok) {
        const newLiked = new Set(likedProducts);
        newLiked.delete(productUrl);
        setLikedProducts(newLiked);
        toast.success('Removed from likes');
      }
    } catch (error) {
      console.error('Error unliking product:', error);
      toast.error('Failed to unlike product');
    }
  };

  const toggleEditLike = async () => {
    if (!userId || !editId) {
      toast.error('Please sign in to like edits');
      return;
    }

    const accessToken = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
    if (!accessToken) {
      toast.error('Please sign in to like edits');
      return;
    }

    const endpoint = isEditLiked ? 'unlike' : 'like';

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/edits/${editId}/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${endpoint} edit`);
      }

      setIsEditLiked(!isEditLiked);
      toast.success(isEditLiked ? 'Edit unliked' : 'Edit liked');
    } catch (error: any) {
      console.error(`Error ${endpoint}ing edit:`, error);
      toast.error(error.message || `Failed to ${endpoint} edit`);
    }
  };

  const handleProductLinkClick = (url: string, title: string) => {
    // Open product link in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleProductLinkClose = () => {
    setSelectedProductUrl(null);
    setSelectedProductTitle(null);
  };

  if (isLoading) {
    return (
      <div className="relative w-full min-h-screen overflow-x-hidden bg-[#fffefd] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e1709]" />
      </div>
    );
  }

  if (!edit) {
    return (
      <div className="relative w-full min-h-screen overflow-x-hidden bg-[#fffefd] flex flex-col items-center justify-center gap-4 px-4">
        <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[16px] text-[#1e1709] tracking-[1px] uppercase">
          Edit not found
        </p>
        <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709]/60 text-center max-w-[300px]">
          This edit may have been deleted or the link is incorrect.
        </p>
        <button
          onClick={() => navigate('/profile')}
          className="mt-2 px-6 py-2.5 bg-[#1e1709] text-[#fffefd] font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase rounded-[4px] hover:bg-[#1e1709]/90 transition-colors"
        >
          Go to Profile
        </button>
      </div>
    );
  }

  const productLinks = edit.product_links || [];

  return (
    <div 
      className="relative w-full min-h-screen overflow-x-hidden bg-[#fffefd]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Top Nav - Back button, username, more menu, and share on same line */}
      <div className="bg-[#fffefd] h-[48px] w-full flex items-center justify-between px-4">
        {/* Left side - Back button and creator name */}
        <div className="flex items-center gap-[12px]">
          {/* Back button */}
          <button 
            className="size-[24px] shrink-0"
            onClick={() => navigate(-1)}
          >
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path d={svgPaths.p13e8e2e0} stroke="#1E1709" strokeLinecap="square" strokeLinejoin="round" strokeWidth="1.1" />
            </svg>
          </button>

          {/* Brand Tag - Creator Name */}
          <div className="bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[30px] px-[12px] py-[4px]">
            <p className="font-['Arial:Regular',sans-serif] text-[13px] text-[#1e1709] tracking-[1px] uppercase leading-[24px]">
              {edit.creator_name || 'CREATOR'}
            </p>
          </div>
        </div>

        {/* More menu and Share buttons */}
        <div className="flex gap-[8px] items-center shrink-0">
          {/* More menu button - only show if user owns this edit */}
          {userId && edit.user_id === userId && (
            <button 
              onClick={() => navigate(`/create-edit/${editId}`)}
              className="relative shrink-0"
            >
              <div className="bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] size-[32px] flex items-center justify-center">
                <div className="flex gap-[3px] items-center">
                  <div className="w-[2px] h-[2px] rounded-full bg-[#1e1709]" />
                  <div className="w-[2px] h-[2px] rounded-full bg-[#1e1709]" />
                  <div className="w-[2px] h-[2px] rounded-full bg-[#1e1709]" />
                </div>
              </div>
            </button>
          )}
          
          {/* Share button */}
          <div className="relative shrink-0 size-[32px]">
            <div className="bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] size-[32px] flex items-center justify-center">
              <svg className="w-[12px] h-[12px]" fill="none" viewBox="0 0 13 12.55">
                <path d="M12.5 8.55V12.05H0.5V8.55" stroke="black" />
                <path d={svgPaths.pde31800} stroke="#1E1709" strokeLinecap="square" strokeLinejoin="round" strokeWidth="1.1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="w-full max-w-[393px] mx-auto px-4"
        style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
      >
        {/* Container for image and products - centered with max-width */}
        <div className="w-full max-w-[340px] mx-auto">
          {/* Main Image - 340px × 509px */}
          <div className="w-full h-[509px] rounded-[8px] border border-[#1e1709] overflow-hidden mb-[15px] mt-4 relative">
            {edit.media_type === 'video' ? (
              <video 
                className="w-full h-full object-cover"
                src={edit.media_url}
                controls
                loop
                playsInline
              />
            ) : (
              <img 
                alt={edit.description || 'Edit'}
                className="w-full h-full object-cover"
                src={edit.media_url}
              />
            )}
            
            {/* Like button on edit */}
            <button
              onClick={toggleEditLike}
              className="absolute top-[12px] right-[16px] z-10"
            >
              <div className="relative w-[36.3px] h-[33.871px]">
                <div className="absolute bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] inset-0" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart 
                    className="w-[16px] h-[16px]" 
                    fill={isEditLiked ? "#1E1709" : "none"}
                    stroke="#1E1709"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </button>
          </div>

          {/* Horizontal scroll of product images - aligned with left edge of main image */}
          {productLinks.length > 0 && (
            <div className="flex gap-[8px] overflow-x-auto pb-2 mb-6 scrollbar-hide">
              {productLinks.map((product: any, index: number) => {
                const isLiked = likedProducts.has(product.url);
                
                return (
                  <div
                    key={index}
                    onClick={() => handleProductLinkClick(product.url, product.title || 'Product')}
                    className="relative shrink-0 group cursor-pointer"
                  >
                    <div className="w-[120px] h-[120px] rounded-[4px] border border-[#1e1709] overflow-hidden bg-white">
                      {product.image ? (
                        <img 
                          alt={product.title || 'Product'} 
                          className="w-full h-full object-cover" 
                          src={product.image} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#f5f5f5]">
                          <div className="text-center p-2">
                            <svg className="w-[24px] h-[24px] mx-auto mb-1" fill="none" viewBox="0 0 16 15.9959">
                              <path d={svgPaths.p35bf1680} fill="#1E1709" />
                              <path d={svgPaths.p5abf740} fill="#1E1709" />
                              <path d={svgPaths.p3f6aa700} fill="#1E1709" />
                            </svg>
                            <p className="font-['Arial:Regular',sans-serif] text-[10px] text-[#1e1709] break-all line-clamp-2">
                              {new URL(product.url).hostname}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Like Button - Bottom Right */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        isLiked ? handleUnlikeProduct(product.url) : handleLikeProduct(product.url, product);
                      }}
                      className="absolute bottom-1 right-1 w-[28px] h-[28px] bg-[rgba(255,254,253,0.95)] border border-[#1e1709] rounded-full flex items-center justify-center transition-all hover:bg-white"
                    >
                      <Heart 
                        className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#1e1709]' : ''} text-[#1e1709]`}
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* External Link */}
        {edit.external_link && (
          <div className="flex gap-[4px] items-start mb-6">
            <div className="shrink-0">
              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 16 15.9959">
                <path d={svgPaths.p35bf1680} fill="#1E1709" />
                <path d={svgPaths.p5abf740} fill="#1E1709" />
                <path d={svgPaths.p3f6aa700} fill="#1E1709" />
              </svg>
            </div>
            <a 
              href={edit.external_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] underline break-all"
            >
              {edit.external_link}
            </a>
          </div>
        )}

        {/* Divider */}
        <div className="h-px w-full bg-[#1e1709] mb-3" />

        {/* Description Section */}
        <button className="flex items-center w-full mb-3">
          <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#130326] flex-1 text-left">
            Description
          </p>
          <svg className="w-[16px] h-[16px] rotate-[-90deg]" fill="none" viewBox="0 0 16 16">
            <path d={svgPaths.p6bef600} stroke="#1E1709" strokeLinecap="square" strokeLinejoin="round" strokeWidth="1.1" />
          </svg>
        </button>

        {/* Divider */}
        <div className="h-px w-full bg-[#1e1709] mb-3" />

        {/* Tags Section */}
        <button className="flex items-center w-full mb-3">
          <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#130326] flex-1 text-left">
            Tags
          </p>
          <svg className="w-[16px] h-[16px] rotate-[-90deg]" fill="none" viewBox="0 0 16 16">
            <path d={svgPaths.p6bef600} stroke="#1E1709" strokeLinecap="square" strokeLinejoin="round" strokeWidth="1.1" />
          </svg>
        </button>

        {/* Divider */}
        <div className="h-px w-full bg-[#1e1709] mb-6" />
      </div>

      {/* Product Link Modal */}
      {selectedProductUrl && selectedProductTitle && (
        <ProductLinkModal
          url={selectedProductUrl}
          title={selectedProductTitle}
          onClose={handleProductLinkClose}
        />
      )}
    </div>
  );
}