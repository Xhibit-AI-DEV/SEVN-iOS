import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Heart, Link, Loader2, Menu, Plus } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { EditProfileModal } from './EditProfileModal';
import { MoreMenuModal } from './MoreMenuModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { IonicBottomNav } from './IonicBottomNav';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

// Cache to prevent refetching
const profileCache: any = {
  data: null,
  timestamp: 0,
};

export function ProfilePage() {
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [edits, setEdits] = useState<any[]>([]);
  const [likedProducts, setLikedProducts] = useState<any[]>([]);
  const [likedEdits, setLikedEdits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likesTab, setLikesTab] = useState<'products' | 'edits'>('products');
  const [userId, setUserId] = useState<string | null>(null);
  const [likedEditIds, setLikedEditIds] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'edits' | 'likes'>('edits');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadAllData = async () => {
      console.log('🔄 ProfilePage: Starting data load...');
      
      // Check cache first (valid for 30 seconds)
      const now = Date.now();
      if (profileCache.data && (now - profileCache.timestamp) < 30000) {
        console.log('✅ Using cached profile data');
        const cached = profileCache.data;
        if (!isCancelled) {
          setProfile(cached.profile);
          setEdits(cached.edits);
          setLikedProducts(cached.likedProducts);
          setLikedEdits(cached.likedEdits);
          setLikedEditIds(cached.likedEditIds);
          setUserId(cached.userId);
          setIsLoading(false);
        }
        return;
      }

      try {
        const accessToken = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
        if (!accessToken) {
          console.log('❌ ProfilePage: No access token found');
          setIsLoading(false);
          return;
        }

        console.log('🔐 Fetching auth info...');
        const authResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/auth/me`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        );

        if (!authResponse.ok) {
          if (authResponse.status === 401) {
            console.log('❌ ProfilePage: Unauthorized - token invalid');
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to authenticate');
        }

        const authData = await authResponse.json();
        const fetchedUserId = authData.user_id;
        console.log('✅ Got user ID:', fetchedUserId);
        
        if (isCancelled) return;

        console.log('📡 Fetching all profile data in parallel...');
        const [profileRes, editsRes, likedProductsRes, likedEditsRes] = await Promise.allSettled([
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/profiles/${fetchedUserId}`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          }),
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/edits/user/${fetchedUserId}`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          }),
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/likes/user/${fetchedUserId}`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          }),
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/edits/liked/${fetchedUserId}`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          }),
        ]);

        if (isCancelled) return;

        let profileData = {
          user_id: fetchedUserId,
          display_name: '',
          bio: '',
          avatar_url: '',
          website_url: '',
          created_edits: [],
          liked_edits: [],
          followers_count: 0,
          following_count: 0,
        };

        let editsData: any[] = [];
        let likedProductsData: any[] = [];
        let likedEditsData: any[] = [];
        let likedIdsSet = new Set<string>();

        // Process profile
        if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
          const data = await profileRes.value.json();
          profileData = data.profile || profileData;
          console.log('✅ Profile loaded:', profileData.display_name || '(empty)');
        } else {
          console.log('⚠️ No profile found, using empty profile');
        }

        // Process edits
        if (editsRes.status === 'fulfilled' && editsRes.value.ok) {
          const data = await editsRes.value.json();
          editsData = data.edits || [];
          console.log('✅ Edits loaded:', editsData.length);
        }

        // Process liked products
        if (likedProductsRes.status === 'fulfilled' && likedProductsRes.value.ok) {
          const data = await likedProductsRes.value.json();
          likedProductsData = data.likes || [];
          console.log('✅ Liked products loaded:', likedProductsData.length);
        }

        // Process liked edits
        if (likedEditsRes.status === 'fulfilled' && likedEditsRes.value.ok) {
          const data = await likedEditsRes.value.json();
          likedEditsData = data.edits || [];
          likedIdsSet = new Set(likedEditsData.map((edit: any) => edit.id));
          console.log('✅ Liked edits loaded:', likedEditsData.length);
        }

        if (isCancelled) return;

        // Cache the data
        profileCache.data = {
          profile: profileData,
          edits: editsData,
          likedProducts: likedProductsData,
          likedEdits: likedEditsData,
          likedEditIds: likedIdsSet,
          userId: fetchedUserId,
        };
        profileCache.timestamp = Date.now();

        // Set all state at once
        setProfile(profileData);
        setEdits(editsData);
        setLikedProducts(likedProductsData);
        setLikedEdits(likedEditsData);
        setLikedEditIds(likedIdsSet);
        setUserId(fetchedUserId);

        console.log('✅ All profile data loaded successfully');

      } catch (error) {
        console.error('❌ Error loading profile data:', error);
        if (!isCancelled) {
          toast.error('Failed to load profile');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
          console.log('✅ Loading complete');
        }
      }
    };

    loadAllData();

    return () => {
      isCancelled = true;
      console.log('🧹 ProfilePage cleanup');
    };
  }, []);

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(updatedProfile);
    setShowEditModal(false);
    // Update cache
    if (profileCache.data) {
      profileCache.data.profile = updatedProfile;
      profileCache.timestamp = Date.now();
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const accessToken = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
      if (!accessToken) {
        toast.error('Please sign in to upload avatar');
        return;
      }

      // Upload avatar
      const formData = new FormData();
      formData.append('avatar', file);

      const uploadResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/profiles/${userId}/avatar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload avatar');
      }

      const uploadData = await uploadResponse.json();
      const newAvatarUrl = uploadData.avatar_url;

      // Update profile with new avatar URL
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/profiles/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...profile,
            avatar_url: newAvatarUrl,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      
      // Update cache
      if (profileCache.data) {
        profileCache.data.profile = data.profile;
        profileCache.timestamp = Date.now();
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarUploadFromCamera = async () => {
    if (!userId) return;

    const accessToken = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
    if (!accessToken) {
      toast.error('Please sign in to upload avatar');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (!image.base64String) {
        throw new Error('Failed to capture image');
      }

      const formData = new FormData();
      formData.append('avatar', `data:image/jpeg;base64,${image.base64String}`);

      const uploadResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/profiles/${userId}/avatar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload avatar');
      }

      const uploadData = await uploadResponse.json();
      const newAvatarUrl = uploadData.avatar_url;

      // Update profile with new avatar URL
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/profiles/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...profile,
            avatar_url: newAvatarUrl,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      
      // Update cache
      if (profileCache.data) {
        profileCache.data.profile = data.profile;
        profileCache.timestamp = Date.now();
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const toggleLikeEdit = async (editId: string) => {
    if (!userId) {
      toast.error('Please sign in to like edits');
      return;
    }

    const accessToken = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
    if (!accessToken) {
      toast.error('Please sign in to like edits');
      return;
    }

    const isLiked = likedEditIds.has(editId);
    const endpoint = isLiked ? 'unlike' : 'like';

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

      const newLikedIds = new Set(likedEditIds);
      if (isLiked) {
        newLikedIds.delete(editId);
        setLikedEdits(likedEdits.filter(edit => edit.id !== editId));
      } else {
        newLikedIds.add(editId);
      }
      setLikedEditIds(newLikedIds);

      setEdits(edits.map(edit => {
        if (edit.id === editId) {
          return {
            ...edit,
            likes_count: isLiked ? (edit.likes_count || 1) - 1 : (edit.likes_count || 0) + 1
          };
        }
        return edit;
      }));

      toast.success(isLiked ? 'Edit unliked' : 'Edit liked');
    } catch (error: any) {
      console.error(`Error ${endpoint}ing edit:`, error);
      toast.error(error.message || `Failed to ${endpoint} edit`);
    }
  };

  const handleLogout = async () => {
    const accessToken = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
    
    if (accessToken) {
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/auth/signout`,
          {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        );
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }

    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');

    // Clear cache
    profileCache.data = null;
    profileCache.timestamp = 0;

    toast.success('Signed out successfully');
    navigate('/signin');
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;

    const accessToken = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
    if (!accessToken) {
      toast.error('Please sign in');
      return;
    }

    try {
      console.log('🗑️  Deleting account for user:', userId);
      
      // Call the backend delete account endpoint
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/auth/delete-account`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      console.log('✅ Account deleted successfully');
      
      // Clear all local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_role');

      // Clear cache
      profileCache.data = null;
      profileCache.timestamp = 0;
      
      toast.success('Account deleted successfully');
      navigate('/signin');
    } catch (error: any) {
      console.error('❌ Error deleting account:', error);
      toast.error(error.message || 'Failed to delete account');
    }
  };

  const handleBlockUser = () => {
    // TODO: Implement block user functionality
    console.log('Block user clicked');
    toast.success('User blocked');
  };

  const handleFollowToggle = () => {
    // TODO: Implement follow/unfollow functionality
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Unfollowed' : 'Followed');
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    const profileUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: `${profile?.display_name || 'User'}'s Profile`,
        url: profileUrl,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied to clipboard');
    }
  };

  const renderEditCard = (edit: any, showCreatorName: boolean = true) => {
    const isLiked = likedEditIds.has(edit.id);

    return (
      <div 
        key={edit.id} 
        className="relative shrink-0 w-[272px] h-[407px] cursor-pointer"
        onClick={() => navigate(`/edit/${edit.id}`)}
      >
        {/* Triple border effect with 4px spacing */}
        <div className="absolute border border-[#1e1709] inset-[4px] opacity-80 rounded-[8px]" />
        <div className="absolute border border-[#1e1709] inset-[8px_0_0_8px] rounded-[8px]" />
        
        {/* Main image container with border */}
        <div className="absolute inset-[0_8px_8px_0] rounded-[8px] overflow-hidden">
          {/* Main image - directly inside container */}
          {edit.media_type === 'video' ? (
            <video 
              className="absolute inset-0 w-full h-full object-cover rounded-[8px]"
              src={edit.media_url}
              muted
              loop
              playsInline
            />
          ) : (
            <img 
              alt={edit.description || 'Edit'}
              className="absolute inset-0 w-full h-full object-cover rounded-[8px]"
              src={edit.media_url}
            />
          )}
          
          {/* Border on top */}
          <div className="absolute border border-[#1e1709] inset-0 rounded-[8px] pointer-events-none" />
          
          {/* Stylist name badge - bottom left */}
          {showCreatorName && edit.creator_name && (
            <div className="absolute bottom-[16px] left-[16px] z-10">
              <div className="bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] px-[14px] h-[30px] flex items-center justify-center">
                <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709] tracking-[1px] uppercase leading-[22px]">
                  {edit.creator_name}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Heart icon - top right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLikeEdit(edit.id);
          }}
          className="absolute top-[12px] right-[16px] z-10"
        >
          <div className="relative w-[36.3px] h-[33.871px]">
            <div className="absolute bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] inset-0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart 
                className="w-[16px] h-[16px]" 
                fill={isLiked ? "#1E1709" : "none"}
                stroke="#1E1709"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </button>
      </div>
    );
  };

  const renderProductCard = (like: any) => {
    const product = like.productData;
    
    return (
      <div 
        key={like.productId} 
        className="relative shrink-0 w-[112px] cursor-pointer border border-[#1e1709] bg-white rounded-[5px] overflow-hidden"
        onClick={() => product?.url && window.open(product.url, '_blank')}
      >
        {/* Product Image */}
        <div className="relative w-full h-[150px] overflow-hidden bg-white">
          {product?.image && (
            <img 
              alt={product.title || 'Product'}
              className="absolute inset-0 w-full h-full object-cover"
              src={product.image}
            />
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-2">
          {product?.title && (
            <p className="font-['Helvetica_Neue:Bold',sans-serif] text-[9px] text-[#1e1709] uppercase mb-1 leading-[1.3]">
              {product.title}
            </p>
          )}
          {product?.price && (
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[11px] text-[#1e1709]">
              {product.price}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="relative w-full min-h-screen overflow-x-hidden bg-[#fffefd] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e1709]" />
      </div>
    );
  }

  return (
    <div 
      className="relative w-full min-h-screen overflow-x-hidden bg-[#fffefd]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Header */}
      <div className="bg-white w-full h-[48px] shrink-0 flex items-center justify-between px-4 border-b border-[#1e1709] max-w-[393px] mx-auto">
        <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[24px] tracking-[3px] text-black">
          VII SEVN
        </p>
        <button 
          onClick={() => {
            console.log('Menu button clicked');
            setShowMoreMenu(true);
          }}
          className="w-8 h-8 flex items-center justify-center hover:bg-[#1e1709]/10 rounded transition-colors z-50"
        >
          <Menu className="w-6 h-6 text-[#1e1709]" strokeWidth={1.1} />
        </button>
      </div>

      {/* Content with bottom safe area padding */}
      <div 
        className="w-full max-w-[393px] mx-auto pt-6 px-4"
        style={{
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
        }}
      >
        {/* Profile Section */}
        <div className="flex items-start gap-8 mb-3">
          {/* Avatar with + button */}
          <div className="relative shrink-0">
            <div className="w-[96px] h-[96px] rounded-full overflow-hidden bg-[#fffefd] flex items-center justify-center border border-[#1e1709]">
              {isUploadingAvatar ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#1e1709]" />
              ) : profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#fffefd]" />
              )}
            </div>
            {/* + icon overlay */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 w-[26px] h-[26px] bg-[#1e1709] border-2 border-[#fffefd] rounded-full flex items-center justify-center hover:bg-[#3e3709] transition-colors disabled:opacity-50"
            >
              <Plus className="w-[14px] h-[14px] text-[#fffefd]" strokeWidth={2.5} />
            </button>
            {/* Hidden file input */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-8 pt-2">
            <div className="flex flex-col gap-1 items-center">
              <p className="font-['Helvetica_Neue:Bold',sans-serif] text-[20px] text-[#1e1709] leading-[normal]">
                {edits.length}
              </p>
              <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[10px] text-[#1e1709] leading-[normal]">
                Edits
              </p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <p className="font-['Helvetica_Neue:Bold',sans-serif] text-[20px] text-[#1e1709] leading-[normal]">
                {profile?.followers_count || 0}
              </p>
              <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[10px] text-[#1e1709] leading-[normal]">
                Followers
              </p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <p className="font-['Helvetica_Neue:Bold',sans-serif] text-[20px] text-[#1e1709] leading-[normal]">
                {profile?.following_count || 0}
              </p>
              <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[10px] text-[#1e1709] leading-[normal]">
                Following
              </p>
            </div>
          </div>
        </div>

        {/* Name and Bio */}
        <div className="mb-3">
          {profile?.display_name && (
            <p className="font-['Helvetica_Neue:Bold',sans-serif] text-[14px] tracking-[0.32px] text-[#1e1709] uppercase leading-[18px] mb-1">
              {profile.display_name}
            </p>
          )}
          
          {profile?.username && (
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709]/60 leading-[18px] mb-2">
              @{profile.username}
            </p>
          )}
          
          {profile?.bio && (
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709] leading-[20px] mb-2">
              {profile.bio}
            </p>
          )}
          
          {profile?.website_url && (
            <a 
              href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709] underline flex items-center gap-1"
            >
              <Link className="w-3.5 h-3.5 shrink-0" />
              {profile.website_url}
            </a>
          )}
        </div>

        {/* Action Buttons - Edit + Messages (own profile) */}
        <div className="flex gap-[10px] mb-6">
          <button 
            onClick={() => setShowEditModal(true)}
            className="flex-1 bg-[#1e1709] text-white h-[36px] flex items-center justify-center hover:bg-[#3e3709] transition-colors"
          >
            <span className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] leading-[18px]">
              EDIT
            </span>
          </button>
          <button 
            onClick={() => navigate('/messages')}
            className="flex-1 bg-[#1e1709] text-white h-[36px] flex items-center justify-center hover:bg-[#3e3709] transition-colors"
          >
            <span className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] leading-[18px]">
              INBOX
            </span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-6 mb-4 border-b border-[#e0e0e0]">
          <button
            onClick={() => setActiveTab('edits')}
            className={`font-['Helvetica_Neue:Medium',sans-serif] text-[13px] tracking-[2px] text-[#1e1709] uppercase pb-3 border-b-2 transition-colors ${
              activeTab === 'edits' ? 'border-[#1e1709]' : 'border-transparent'
            }`}
          >
            POSTS
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`font-['Helvetica_Neue:Medium',sans-serif] text-[13px] tracking-[2px] text-[#1e1709] uppercase pb-3 border-b-2 transition-colors ${
              activeTab === 'likes' ? 'border-[#1e1709]' : 'border-transparent'
            }`}
          >
            LIKES
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'edits' && (
          <div className="mb-6">
            {edits.length > 0 ? (
              <div className="flex gap-[8px] overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {edits.map(edit => renderEditCard(edit, false))}
              </div>
            ) : (
              <div className="relative w-[300px] h-[450px]">
                {/* Stacked cards effect - showing 3 layers with 4px spacing */}
                <div className="absolute left-0 top-0 w-full h-full">
                  {/* Back card - 8px offset */}
                  <div 
                    className="absolute w-full h-full rounded-[8px] border border-[#1e1709] bg-[#f5f5f5]"
                    style={{ 
                      left: '8px',
                      top: '8px',
                      right: '0px',
                      bottom: '0px'
                    }}
                  />
                  {/* Middle card - 4px offset */}
                  <div 
                    className="absolute w-full h-full rounded-[8px] border border-[#1e1709] bg-[#f5f5f5]"
                    style={{ 
                      left: '4px',
                      top: '4px',
                      right: '4px',
                      bottom: '4px'
                    }}
                  />
                  {/* Front card */}
                  <div 
                    className="absolute w-full h-full rounded-[8px] border border-[#1e1709] bg-[#f5f5f5]"
                    style={{ 
                      left: '0px',
                      top: '0px',
                      right: '8px',
                      bottom: '8px'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <div className="mb-6">
            {/* Products Column */}
            <div className="mb-6">
              <h3 className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] tracking-[1px] text-[#1e1709] uppercase mb-3 leading-[20px]">
                Products
              </h3>
              {likedProducts.length > 0 ? (
                <div className="flex gap-[12px] overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  {likedProducts.map(like => renderProductCard(like))}
                </div>
              ) : (
                <div className="flex gap-[12px] overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  {/* Empty state - outline boxes */}
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i}
                      className="relative shrink-0 w-[112px] border border-[#1e1709] bg-[#f5f5f5]"
                    >
                      <div className="w-full h-[150px]" />
                      <div className="p-2 h-[44px]" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edits Column */}
            <div>
              <h3 className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] tracking-[1px] text-[#1e1709] uppercase mb-3 leading-[20px]">
                Edits
              </h3>
              {likedEdits.length > 0 ? (
                <div className="flex gap-[8px] overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  {likedEdits.map(edit => renderEditCard(edit, true))}
                </div>
              ) : (
                <div className="relative w-[300px] h-[450px]">
                  {/* Stacked cards effect - showing 3 layers with 4px spacing */}
                  <div className="absolute left-0 top-0 w-full h-full">
                    {/* Back card - 8px offset */}
                    <div 
                      className="absolute w-full h-full rounded-[8px] border border-[#1e1709] bg-[#f5f5f5]"
                      style={{ 
                        left: '8px',
                        top: '8px',
                        right: '0px',
                        bottom: '0px'
                      }}
                    />
                    {/* Middle card - 4px offset */}
                    <div 
                      className="absolute w-full h-full rounded-[8px] border border-[#1e1709] bg-[#f5f5f5]"
                      style={{ 
                        left: '4px',
                        top: '4px',
                        right: '4px',
                        bottom: '4px'
                      }}
                    />
                    {/* Front card */}
                    <div 
                      className="absolute w-full h-full rounded-[8px] border border-[#1e1709] bg-[#f5f5f5]"
                      style={{ 
                        left: '0px',
                        top: '0px',
                        right: '8px',
                        bottom: '8px'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom navigation */}
      <IonicBottomNav />

      {/* Edit Profile Modal */}
      {showEditModal && userId && (
        <EditProfileModal
          userId={userId}
          currentProfile={profile}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}

      {/* More Menu Modal */}
      <MoreMenuModal
        isOpen={showMoreMenu}
        onClose={() => setShowMoreMenu(false)}
        isOwnProfile={true}
        onDeleteAccount={() => {
          setShowMoreMenu(false);
          setShowDeleteModal(true);
        }}
        onBlockUser={handleBlockUser}
        onLogout={handleLogout}
      />

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}