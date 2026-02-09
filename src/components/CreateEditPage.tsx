import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonBackButton } from '@ionic/react';
import svgPaths from "../imports/svg-ib8s7izy1q";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { Loader2, Camera, Image as ImageIcon } from 'lucide-react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import laundromatImage from 'figma:asset/1f70f8addd2ecb3091c805e461a74ebf7efafd81.png';

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

    // Normalize URL - remove protocol if present, remove trailing slash
    let normalizedUrl = newShoppingLink.trim();
    normalizedUrl = normalizedUrl.replace(/^https?:\/\//, '');
    normalizedUrl = normalizedUrl.replace(/\/$/, '');
    
    // Validate it's a real URL format (must have at least domain.tld/something)
    try {
      const testUrl = normalizedUrl.startsWith('http') ? normalizedUrl : `https://${normalizedUrl}`;
      new URL(testUrl);
      
      // Must have a path or be a valid domain
      if (!normalizedUrl.includes('.')) {
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
      if (!accessToken) {
        toast.error('Please sign in to publish an edit');
        navigate('/signin');
        return;
      }

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

      if (!editResponse.ok) {
        const errorData = await editResponse.json();
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'create'} edit`);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      {/* Top Nav - Fixed header area */}
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle className="font-['Helvetica_Neue:Regular',sans-serif] text-[24px] tracking-[3px] text-black">
            POST EDIT
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      {/* EVERYTHING scrolls here */}
      <IonContent className="w-full" style={{ paddingBottom: '50px' }}>
        {/* Loading state for edit mode */}
        {isLoadingEdit && (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin w-8 h-8 text-[#1e1709]" />
          </div>
        )}

        {/* Main Content */}
        {!isLoadingEdit && (
          <div className="w-full px-4 pb-24">
            
            {/* Upload Landing Screen - Only show in create mode if no media yet */}
            {!isEditMode && !mainMedia && (
              <div className="flex flex-col items-center px-6 pt-4 pb-8">
                {/* Image with triple border effect - matching Chris's edit on HomePage */}
                <div className="relative w-full max-w-[280px] h-[400px] mb-6">
                  {/* Triple border effect with 4px spacing */}
                  <div className="absolute border border-[#1e1709] inset-[4px] opacity-80 rounded-[8px]" />
                  <div className="absolute border border-[#1e1709] inset-[8px_0_0_8px] rounded-[8px]" />
                  
                  {/* Main image container with border */}
                  <div className="absolute inset-[0_8px_8px_0] rounded-[8px]">
                    <img 
                      src={laundromatImage}
                      alt="Fashion example"
                      className="absolute inset-0 w-full h-full object-cover rounded-[8px]"
                    />
                    {/* Border on top */}
                    <div className="absolute border border-[#1e1709] inset-0 rounded-[8px] pointer-events-none" />
                  </div>
                </div>

                {/* Headline text */}
                <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[20px] leading-[18px] text-[#1e1709] text-center mb-2 px-2">
                  STYLE → SELL
                </h2>
                
                {/* Subheadline text */}
                <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] leading-[26px] tracking-[1px] text-[#1e1709] text-center mb-8 max-w-[280px] px-2">
                  Link your Edit to Depop or Shops
                </p>

                {/* Upload button */}
                <button
                  onClick={handleNativeMediaPick}
                  className="w-full max-w-[280px] bg-[#1e1709] text-[#fffefd] py-4 rounded-[8px] font-['Helvetica_Neue:Bold',sans-serif] text-[16px] tracking-[2px] uppercase"
                >
                  UPLOAD
                </button>
              </div>
            )}

            {/* Media Preview - Show in edit mode or after upload in create mode */}
            {(isEditMode || mainMedia) && mainMedia && (
              <div className="relative w-full h-[471px] rounded-[8px] border border-[#1e1709] overflow-hidden mb-2">
                {mediaType === 'image' ? (
                  <img 
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                    src={mainMedia}
                  />
                ) : (
                  <video 
                    className="w-full h-full object-cover"
                    src={mainMedia}
                    controls
                  />
                )}
              </div>
            )}

            {/* File input - only enabled in create mode */}
            {!isEditMode && (
              <input 
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            )}

            {/* Shopping Links */}
            {mainMedia && (
              <>
                <div className="mb-6">
                  <div className="flex gap-2 mb-3">
                    <input
                      type="url"
                      value={newShoppingLink}
                      onChange={(e) => setNewShoppingLink(e.target.value)}
                      placeholder="Add shopping link"
                      className="flex-1 border border-[#1e1709] rounded-[8px] px-3 py-2 font-['Arial:Regular',sans-serif] text-[14px] bg-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddShoppingLink();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddShoppingLink}
                      className="bg-[#1e1709] text-white px-4 py-2 rounded-[8px] font-['Arial:Regular',sans-serif] text-[14px]"
                    >
                      Add
                    </button>
                  </div>

                  {/* Shopping link thumbnails */}
                  {shoppingLinks.length > 0 && (
                    <div className="flex gap-[8px] overflow-x-auto pb-2 scrollbar-hide">
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
                          <div key={index} className="relative shrink-0 w-[100px] h-[100px] rounded-[8px] border border-[#1e1709] overflow-hidden bg-[#f5f5f5]">
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
                              <span className="text-[12px] leading-none">×</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Edit Link */}
                <div className="mb-6">
                  <div className="flex gap-[4px] items-center mb-2">
                    <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 16 15.9959">
                      <path d={svgPaths.p35bf1680} fill="#1E1709" />
                      <path d={svgPaths.p5abf740} fill="#1E1709" />
                      <path d={svgPaths.p3f6aa700} fill="#1E1709" />
                    </svg>
                    <label className="font-['Arial:Regular',sans-serif] text-[14px] text-[#1e1709]">
                      Edit Link
                    </label>
                  </div>
                  <input
                    type="url"
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full border border-[#1e1709] rounded-[8px] px-3 py-2 font-['Helvetica_Neue:Regular',sans-serif] text-[14px] bg-white outline-none"
                  />
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

                {/* Private Toggle */}
                <div className="flex items-center justify-end gap-[8px] py-4">
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

                {/* Bottom Publish/Save Button */}
                <button 
                  className="w-full bg-[#1e1709] text-white py-3 rounded-[8px] font-['Arial:Regular',sans-serif] text-[16px] font-bold disabled:opacity-50 mt-6"
                  onClick={handlePublish}
                  disabled={!mainMedia || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>{isEditMode ? 'Saving...' : 'Publishing...'}</span>
                    </div>
                  ) : (
                    isEditMode ? 'Save Changes' : 'Publish'
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}