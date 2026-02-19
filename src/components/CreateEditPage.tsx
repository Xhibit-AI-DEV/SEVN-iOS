import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Loader2, Camera, Image as ImageIcon, X, MoreHorizontal, Trash2, ArrowLeft } from 'lucide-react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import svgPaths from '../imports/svg-ib8s7izy1q';
import exampleImage from 'figma:asset/2f209977b7bac06e4fe00539ef0b7db92574c8b3.png';

export function CreateEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { editId } = useParams<{ editId?: string }>();
  const isEditMode = !!editId;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get media from navigation state (if passed from BottomNavigation)
  const navigationState = location.state as { mediaUrl?: string; mediaFile?: File; mediaType?: 'image' | 'video' } | null;
  
  const [mainMedia, setMainMedia] = useState<string | null>(navigationState?.mediaUrl || null);
  const [mediaFile, setMediaFile] = useState<File | null>(navigationState?.mediaFile || null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(navigationState?.mediaType || null);
  const [editLink, setEditLink] = useState('');
  const [shoppingLinks, setShoppingLinks] = useState<Array<{ url: string; title?: string; image?: string }>>([]);
  const [newShoppingLink, setNewShoppingLink] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(isEditMode);
  
  // More menu state
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load existing edit data if in edit mode
  useEffect(() => {
    if (isEditMode && editId) {
      const loadEdit = async () => {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/edits/${editId}`,
            {
              headers: { 'Authorization': `Bearer ${publicAnonKey}` },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to load edit');
          }

          const data = await response.json();
          const editData = data.edit;

          // Populate form with existing data
          setMainMedia(editData.media_url);
          setMediaType(editData.media_type);
          setEditLink(editData.external_link || '');
          setDescription(editData.description || '');
          setTags(editData.tags?.join(', ') || '');
          setIsPrivate(editData.is_private || false);
          setShowDescription(!!editData.description);
          setShowTags(!!(editData.tags && editData.tags.length > 0));

          // Load product links
          if (editData.product_links && editData.product_links.length > 0) {
            setShoppingLinks(editData.product_links.map((link: any) => ({
              url: link.url,
              title: link.title,
              image: link.image,
            })));
          }

          setIsLoadingEdit(false);
        } catch (error: any) {
          console.error('Error loading edit:', error);
          toast.error('Failed to load edit');
          navigate(-1);
        }
      };

      loadEdit();
    }
  }, [isEditMode, editId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMainMedia(url);
      setMediaFile(file);
      
      if (file.type.startsWith('image/')) {
        setMediaType('image');
      } else if (file.type.startsWith('video/')) {
        setMediaType('video');
      }
    }
  };

  // Native media picker
  const handleNativeMediaPick = async () => {
    // Check if running on native platform
    if (!Capacitor.isNativePlatform()) {
      // Fallback to web file input
      fileInputRef.current?.click();
      return;
    }

    try {
      // Go directly to photo library without showing action sheet
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos, // Go directly to photo library
      });

      if (image.webPath) {
        // Convert to blob for upload
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], `edit-${Date.now()}.${image.format}`, {
          type: `image/${image.format}`
        });

        setMainMedia(image.webPath);
        setMediaFile(file);
        setMediaType('image');
      }
    } catch (error) {
      console.error('Error picking media:', error);
      // User cancelled - navigate back if in create mode and no media yet
      if (!isEditMode && !mainMedia) {
        navigate(-1);
      }
    }
  };

  const handleAddShoppingLink = async () => {
    if (!newShoppingLink.trim()) return;
    
    if (shoppingLinks.length >= 40) {
      return;
    }

    // Normalize URL - add https:// if not present
    let normalizedUrl = newShoppingLink.trim();
    
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
        return;
      }
      
    } catch (e) {
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
      
      console.log('📦 Metadata response for', normalizedUrl, ':', data);
      console.log('🖼️ Image URL:', data.image);
      console.log('🔍 Full link object being added:', {
        url: data.url || normalizedUrl,
        title: data.title || 'Product Link',
        image: data.image || null,
      });
      
      setShoppingLinks([...shoppingLinks, {
        url: data.url || normalizedUrl,
        title: data.title || 'Product Link',
        image: data.image || null,
      }]);
      setNewShoppingLink('');
      
      // Additional debug log after state update
      console.log('✅ Shopping links array after adding:', [...shoppingLinks, {
        url: data.url || normalizedUrl,
        title: data.title || 'Product Link',
        image: data.image || null,
      }]);
    } catch (error) {
      console.error('Error fetching product metadata:', error);
      // Still add the link even if metadata fetch fails
      setShoppingLinks([...shoppingLinks, {
        url: normalizedUrl,
        title: 'Product Link',
      }]);
      setNewShoppingLink('');
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const removeShoppingLink = (index: number) => {
    setShoppingLinks(shoppingLinks.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!mainMedia) {
      return;
    }

    setIsLoading(true);

    try {
      // Get access token (check both possible storage keys for backwards compatibility)
      const accessToken = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
      
      console.log('🔐 CreateEditPage auth check:', {
        hasAccessToken: !!localStorage.getItem('access_token'),
        hasAuthToken: !!localStorage.getItem('auth_token'),
        finalToken: !!accessToken,
        userId: localStorage.getItem('user_id'),
        userEmail: localStorage.getItem('user_email'),
      });
      
      if (!accessToken) {
        console.error('❌ No access token found in localStorage');
        toast.error('Please sign in to publish an edit');
        setIsLoading(false);
        return;
      }

      // Validate token before proceeding
      console.log('🔍 Validating token...');
      const validationResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/auth/validate-token`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      if (!validationResponse.ok) {
        console.error('❌ Token validation failed');
        toast.error('Session expired. Please sign in again.');
        // Clear expired tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_email');
        // Redirect to auth
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
        setIsLoading(false);
        return;
      }

      console.log('✅ Token validated successfully');

      let mediaUrl = mainMedia;

      // Only upload new media if a new file was selected
      if (mediaFile) {
        const formData = new FormData();
        formData.append('image', mediaFile);
        formData.append('fileName', `edit-${Date.now()}`);

        const uploadResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/upload-image`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload media');
        }

        const uploadData = await uploadResponse.json();
        mediaUrl = uploadData.url;
        console.log('✅ Media uploaded:', mediaUrl);
      }

      // Create or update edit
      console.log('📝 Sending edit data to server:', {
        media_url: mediaUrl,
        media_type: mediaType,
        hasDescription: !!description,
        hasTags: !!tags,
        hasExternalLink: !!editLink,
        productLinksCount: shoppingLinks.length,
        is_public: !isPrivate,
      });

      const editResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/edits${isEditMode ? `/${editId}` : ''}`,
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            media_url: mediaUrl,
            media_type: mediaType,
            description,
            tags: tags.split(',').map(t => t.trim()).filter(t => t),
            external_link: editLink,
            product_links: shoppingLinks,
            is_public: !isPrivate,
          }),
        }
      );

      console.log('📡 Edit response status:', editResponse.status);

      if (!editResponse.ok) {
        const errorData = await editResponse.json();
        console.error('❌ Edit creation failed:', errorData);
        
        // Handle JWT expiration specifically
        if (errorData.error === 'JWT_EXPIRED' || errorData.code === 401) {
          toast.error('Session expired. Please sign in again.');
          // Clear tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('auth_token');
          // Redirect to auth after a delay
          setTimeout(() => {
            navigate('/auth');
          }, 2000);
          return;
        }
        
        throw new Error(errorData.message || errorData.error || `Failed to ${isEditMode ? 'update' : 'create'} edit`);
      }

      const editData = await editResponse.json();
      console.log(`✅ Edit ${isEditMode ? 'updated' : 'created'}:`, editData.edit);
      
      // Navigate back to the edit detail page if editing, otherwise go to profile
      if (isEditMode) {
        navigate(`/edit/${editId}`);
      } else {
        navigate('/profile');
      }
    } catch (error: any) {
      console.error(`❌ Error ${isEditMode ? 'updating' : 'publishing'} edit:`, error);
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'publish'} edit`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEdit = async () => {
    if (!editId) {
      return;
    }

    setIsDeleting(true);

    try {
      // Get access token (check both possible storage keys for backwards compatibility)
      const accessToken = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
      
      console.log('🔐 CreateEditPage auth check:', {
        hasAccessToken: !!localStorage.getItem('access_token'),
        hasAuthToken: !!localStorage.getItem('auth_token'),
        finalToken: !!accessToken,
        userId: localStorage.getItem('user_id'),
        userEmail: localStorage.getItem('user_email'),
      });
      
      if (!accessToken) {
        console.error('❌ No access token found in localStorage');
        toast.error('Please sign in to delete an edit');
        setIsDeleting(false);
        return;
      }

      // Delete edit
      console.log('📝 Sending delete request to server:', {
        editId,
      });

      const deleteResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/edits/${editId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      console.log('📡 Delete response status:', deleteResponse.status);

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        console.error('❌ Edit deletion failed:', errorData);
        throw new Error(errorData.error || `Failed to delete edit`);
      }

      const deleteData = await deleteResponse.json();
      console.log(`✅ Edit deleted:`, deleteData.edit);
      
      // Navigate back to profile
      navigate('/profile');
    } catch (error: any) {
      console.error(`❌ Error deleting edit:`, error);
      toast.error(error.message || `Failed to delete edit`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full h-screen bg-white overflow-x-hidden flex flex-col max-w-[393px] mx-auto" style={{ maxWidth: '393px' }}>
      {/* Hidden file input - always available for web fallback (only in create mode) */}
      {!isEditMode && (
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      )}
      
      {/* SECTION 1 — Fixed Header */}
      <div className="shrink-0 bg-white border-b border-gray-200">
        {/* Header content - 16px top padding, 20px horizontal */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          {/* Empty space on left to balance the close button on right */}
          <div className="w-6 h-6" />
          
          {/* Title centered */}
          <h1 className="font-['Helvetica_Neue',sans-serif] text-[16px] tracking-[2px] text-[#1e1709] uppercase font-normal">
            {isEditMode ? 'EDIT POST' : 'POST EDIT'}
          </h1>
          
          {/* Right side - More menu (if editing) or Close button */}
          {isEditMode ? (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoreMenu(!showMoreMenu);
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-[#1e1709]" strokeWidth={1.5} />
              </button>
              
              {/* More menu dropdown */}
              {showMoreMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMoreMenu(false);
                    }}
                  />
                  
                  {/* Menu - positioned to not overflow screen */}
                  <div className="absolute right-0 top-10 z-50 w-[120px]">
                    <div className="bg-white border border-black/10 rounded-lg shadow-lg overflow-hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this edit? This cannot be undone.')) {
                            handleDeleteEdit();
                          }
                          setShowMoreMenu(false);
                        }}
                        disabled={isDeleting}
                        className="w-full flex items-center gap-2 px-3 py-3 hover:bg-black/5 transition-colors text-left disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 text-black animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-black" strokeWidth={1.5} />
                        )}
                        <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-black">
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button 
              onClick={() => navigate(-1)} 
              className="p-0"
            >
              <X className="w-6 h-6 text-[#1e1709]" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* SECTION 2 — Scrollable Content (fills vertical space) */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading state for edit mode */}
        {isLoadingEdit && (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin w-8 h-8 text-[#1e1709]" />
          </div>
        )}

        {/* Main Content - NO DUPLICATION */}
        {!isLoadingEdit && (
          <>
            {/* Upload Landing Screen - Only show in create mode if no media yet */}
            {!isEditMode && !mainMedia && (
              <div className="flex flex-col px-5">
                {/* 32px spacing from header */}
                <div className="h-[32px]" />
                
                {/* Content block - top-anchored, not vertically centered */}
                <div className="flex flex-col items-center">
                  {/* Image with triple border effect - fixed height 410px, editorial width 330px */}
                  <div className="w-full max-w-[330px]">
                    <div className="relative w-full h-[410px]">
                      {/* Triple border effect with 4px spacing */}
                      <div className="absolute border border-[#1e1709] inset-[4px] opacity-80 rounded-[8px]" />
                      <div className="absolute border border-[#1e1709] inset-[8px_0_0_8px] rounded-[8px]" />
                      
                      {/* Main image container with border */}
                      <div className="absolute inset-[0_8px_8px_0] rounded-[8px]">
                        <img 
                          src={exampleImage}
                          alt="Fashion example"
                          className="absolute inset-0 w-full h-full object-cover rounded-[8px]"
                        />
                        {/* Border on top */}
                        <div className="absolute border border-[#1e1709] inset-0 rounded-[8px] pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* 16px spacing from image to title */}
                  <div className="h-[16px]" />

                  {/* Title - section header */}
                  <h2 className="font-['Helvetica_Neue',sans-serif] text-[20px] leading-[26px] text-[#1e1709] text-center tracking-[1px] w-full max-w-[330px]">
                    CURATE & LINK
                  </h2>
                  
                  {/* 8px spacing from title to subtext - tight text block */}
                  <div className="h-[8px]" />
                  
                  {/* Subtext */}
                  <p className="font-['Helvetica_Neue',sans-serif] text-[12px] leading-[16px] tracking-[1px] text-[#1e1709] text-center uppercase opacity-90 w-full max-w-[330px]">
                    ADD DEPOP OR SHOP LINKS TO YOUR POST
                  </p>

                  {/* 20px spacing from subtext to button - action-focused */}
                  <div className="h-[20px]" />

                  {/* Upload button */}
                  <button
                    onClick={handleNativeMediaPick}
                    className="w-full max-w-[330px] py-3 bg-[#1E1709] text-white rounded-lg font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] uppercase hover:bg-[#1E1709]/90 transition-colors flex items-center justify-center"
                  >
                    UPLOAD
                  </button>
                </div>

                {/* Remaining space falls below button - top-anchored design */}
              </div>
            )}

            {/* Media Preview - Show in edit mode or after upload in create mode */}
            {(isEditMode || mainMedia) && mainMedia && (
              <div className="px-5 pt-6">
                {/* Container for image and products - centered with max-width */}
                <div className="w-full max-w-[340px] mx-auto">
                  {/* Media Preview - 340px x 509px with single border */}
                  <div className="w-full h-[509px] rounded-[8px] border border-[#1e1709] overflow-hidden mb-[15px]">
                    {mediaType === 'video' ? (
                      <video 
                        className="w-full h-full object-cover"
                        src={mainMedia}
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img 
                        alt="Upload preview"
                        className="w-full h-full object-cover"
                        src={mainMedia}
                      />
                    )}
                  </div>

                  {/* Shopping Links Input - full width */}
                  <div className="mb-6">
                    <div className="flex gap-2 mb-3">
                      <input
                        type="url"
                        value={newShoppingLink}
                        onChange={(e) => setNewShoppingLink(e.target.value)}
                        placeholder="Add shopping link"
                        className="flex-1 border border-[#1e1709] rounded-[12px] px-4 py-3 font-['Helvetica_Neue',sans-serif] text-[14px] bg-white"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddShoppingLink();
                          }
                        }}
                      />
                      <button
                        onClick={handleAddShoppingLink}
                        disabled={isFetchingMetadata}
                        className="bg-[#1e1709] text-white px-6 h-[52px] rounded-[12px] font-['Helvetica_Neue',sans-serif] text-[14px] tracking-[1px] uppercase font-medium hover:bg-[#2a2010] active:bg-[#3e3709] transition-colors disabled:opacity-50"
                      >
                        {isFetchingMetadata ? (
                          <Loader2 className="animate-spin w-5 h-5" />
                        ) : (
                          'ADD'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Shopping link thumbnails - aligned with left edge of main image */}
                  {shoppingLinks.length > 0 && (
                    <div className="flex gap-[8px] overflow-x-auto pb-2 mb-6 scrollbar-hide">
                      {shoppingLinks.map((link, index) => {
                        let hostname = 'Product';
                        try {
                          if (link.url) {
                            hostname = new URL(link.url).hostname;
                          }
                        } catch (e) {
                          hostname = link.url || 'Product';
                        }
                        
                        console.log(`🖼️ Rendering link ${index}:`, {
                          url: link.url,
                          title: link.title,
                          image: link.image,
                          hasImage: !!link.image
                        });
                        
                        return (
                          <div key={index} className="relative shrink-0 w-[100px] h-[100px] rounded-[12px] border border-[#1e1709] overflow-hidden bg-[#f5f5f5]">
                            {link.image ? (
                              <img 
                                src={link.image} 
                                alt={link.title || 'Product'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error(`❌ Failed to load image for ${link.url}:`, link.image);
                                  console.error('Image load error:', e);
                                }}
                                onLoad={() => {
                                  console.log(`✅ Successfully loaded image for ${link.url}`);
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center p-2">
                                  <svg className="w-[24px] h-[24px] mx-auto mb-1" fill="none" viewBox="0 0 16 15.9959">
                                    <path d={svgPaths.p35bf1680} fill="#1E1709" />
                                    <path d={svgPaths.p5abf740} fill="#1E1709" />
                                    <path d={svgPaths.p3f6aa700} fill="#1E1709" />
                                  </svg>
                                  <p className="font-['Arial:Regular',sans-serif] text-[10px] text-[#1e1709] break-all line-clamp-2">
                                    {hostname}
                                  </p>
                                </div>
                              </div>
                            )}
                            <button
                              onClick={() => removeShoppingLink(index)}
                              className="absolute top-1 right-1 bg-white border border-[#1e1709] rounded-full size-[20px] flex items-center justify-center z-10"
                            >
                              <X className="text-[12px] leading-none" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-[1px] w-full bg-[#1e1709] mb-0" />

                {/* Description Section */}
                <div>
                  <button 
                    className="flex items-center w-full py-4"
                    onClick={() => setShowDescription(!showDescription)}
                  >
                    <p className="font-['Arial:Regular',sans-serif] text-[16px] text-black flex-1 text-left">
                      Description
                    </p>
                    <svg 
                      className={`w-[20px] h-[20px] transition-transform ${showDescription ? 'rotate-180' : 'rotate-0'}`} 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 9l6 6 6-6" stroke="#1E1709" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  
                  {showDescription && (
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your look..."
                      className="w-full px-0 py-2 font-['Arial:Regular',sans-serif] text-[14px] bg-transparent border-0 outline-none mb-4 resize-none"
                      rows={3}
                    />
                  )}
                </div>

                {/* Divider */}
                <div className="h-[1px] w-full bg-[#1e1709] mb-0" />

                {/* Tags Section */}
                <div>
                  <button 
                    className="flex items-center w-full py-4"
                    onClick={() => setShowTags(!showTags)}
                  >
                    <p className="font-['Arial:Regular',sans-serif] text-[16px] text-black flex-1 text-left">
                      Tags
                    </p>
                    <svg 
                      className={`w-[20px] h-[20px] transition-transform ${showTags ? 'rotate-180' : 'rotate-0'}`} 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 9l6 6 6-6" stroke="#1E1709" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  
                  {showTags && (
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="streetwear, vintage, designer..."
                      className="w-full px-0 py-2 font-['Arial:Regular',sans-serif] text-[14px] bg-transparent border-0 outline-none mb-4"
                    />
                  )}
                </div>

                {/* Divider */}
                <div className="h-[1px] w-full bg-[#1e1709] mb-0" />

                {/* Private Toggle - Only show in edit mode */}
                {isEditMode && (
                  <div className="flex items-center justify-end gap-[8px] py-4 mb-20">
                    <p className="font-['Arial:Regular',sans-serif] text-[14px] text-black">
                      Private
                    </p>
                    <button
                      onClick={() => setIsPrivate(!isPrivate)}
                      className={`h-[24px] w-[44px] rounded-[40px] relative transition-colors ${
                        isPrivate ? 'bg-[#1e1709]' : 'bg-[#d0d0d0]'
                      }`}
                    >
                      <div 
                        className={`absolute bg-white rounded-full size-[20px] top-[2px] transition-all ${
                          isPrivate ? 'left-[22px]' : 'left-[2px]'
                        }`} 
                      />
                    </button>
                  </div>
                )}

                {/* Add bottom margin when NOT in edit mode */}
                {!isEditMode && <div className="mb-20" />}
              </div>
            )}
          </>
        )}
      </div>

      {/* SECTION 3 — Fixed Bottom Button (above safe area) */}
      {!isLoadingEdit && (
        <>
          {/* Publish/Save button - shown after media is uploaded */}
          {(isEditMode || mainMedia) && mainMedia && (
            <div className="shrink-0 px-5 pb-[34px] pt-4 bg-white border-t border-gray-200">
              <button 
                className="w-full h-[52px] bg-[#1e1709] text-white rounded-[16px] font-['Helvetica_Neue',sans-serif] text-[14px] tracking-[1px] uppercase font-medium hover:bg-[#2a2010] active:bg-[#3e3709] transition-colors disabled:opacity-50"
                onClick={handlePublish}
                disabled={!mainMedia || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span>{isEditMode ? 'SAVING...' : 'PUBLISHING...'}</span>
                  </div>
                ) : (
                  isEditMode ? 'SAVE CHANGES' : 'PUBLISH'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}