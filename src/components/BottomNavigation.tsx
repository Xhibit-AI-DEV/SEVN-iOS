import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

interface BottomNavigationProps {
  activeTab?: 'discover' | 'profile';
  className?: string;
}

export function BottomNavigation({ activeTab = 'discover', className = '' }: BottomNavigationProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
      const halfwayPoint = pageHeight / 2;
      
      // Only hide after scrolling past halfway
      if (currentScrollY > halfwayPoint) {
        if (currentScrollY > lastScrollY) {
          // Scrolling down - hide navigation
          setIsVisible(false);
        } else {
          // Scrolling up - show navigation
          setIsVisible(true);
        }
      } else {
        // Always show before halfway
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleCreateClick = async () => {
    console.log('🎬 ========== CREATE BUTTON CLICKED ==========');
    console.log('🎬 Is native platform:', Capacitor.isNativePlatform());
    console.log('🎬 Platform:', Capacitor.getPlatform());
    
    // Check if running on native platform
    if (!Capacitor.isNativePlatform()) {
      // On web, just navigate to create page (will show file input)
      console.log('🌐 Web platform - navigating to /create-edit');
      navigate('/create-edit');
      return;
    }

    console.log('📱 Native platform detected - opening camera picker...');
    
    try {
      console.log('📸 Calling CapacitorCamera.getPhoto...');
      
      // Open photo library directly
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos, // Go directly to photo library
      });

      console.log('✅ Image selected:', {
        webPath: image.webPath,
        format: image.format,
        hasWebPath: !!image.webPath
      });

      if (image.webPath) {
        console.log('🔄 Converting image to blob...');
        // Convert to blob for upload
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], `edit-${Date.now()}.${image.format}`, {
          type: `image/${image.format}`
        });

        console.log('✅ File created:', {
          name: file.name,
          size: file.size,
          type: file.type
        });

        console.log('🚀 Navigating to /create-edit with media...');
        // Navigate to CreateEditPage with the selected media
        navigate('/create-edit', {
          state: {
            mediaUrl: image.webPath,
            mediaFile: file,
            mediaType: 'image'
          }
        });
        console.log('✅ Navigation complete');
      }
    } catch (error) {
      console.error('❌ Error picking media:', error);
      console.error('❌ Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      // User cancelled - do nothing
    }
    
    console.log('🎬 ========== CREATE BUTTON HANDLER END ==========');
  };

  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 h-[80px] bg-white 
        flex items-end justify-center
        border-t border-[#1e1709]
        ${className}
      `}
    >
      <div className="flex items-end justify-center mx-auto px-8" style={{ gap: '40px' }}>
        {/* Home/Discover */}
        <button
          className="flex flex-col items-center justify-center"
          onClick={() => navigate('/')}
        >
          <div 
            className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all ${
              activeTab === 'discover' ? 'scale-110' : ''
            }`}
            style={{ backgroundColor: 'rgba(255, 254, 253, 0.85)' }}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="w-[20px] h-[20px]"
              style={{ opacity: activeTab === 'discover' ? 1 : 0.6 }}
            >
              <rect 
                x="4" 
                y="4" 
                width="16" 
                height="16" 
                stroke="#1E1709" 
                strokeWidth="1" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>

        {/* Create - Center button - floats 6px higher */}
        <button
          className="flex flex-col items-center justify-center"
          style={{ marginBottom: '6px' }}
          onClick={handleCreateClick}
        >
          <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center relative" style={{ backgroundColor: 'rgba(255, 254, 253, 0.85)', boxShadow: '0 3px 12px rgba(0, 0, 0, 0.12)', zIndex: 10 }}>
            <Plus className="w-[26px] h-[26px] text-[#1e1709]" strokeWidth={1} />
          </div>
        </button>

        {/* Profile */}
        <button
          className="flex flex-col items-center justify-center"
          onClick={() => navigate('/profile')}
        >
          <div 
            className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all ${
              activeTab === 'profile' ? 'scale-110' : ''
            }`}
            style={{ backgroundColor: 'rgba(255, 254, 253, 0.85)' }}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="w-[20px] h-[20px]"
              style={{ opacity: activeTab === 'profile' ? 1 : 0.6 }}
            >
              <path 
                d="M12 4L20 20H4L12 4Z" 
                stroke="#1E1709" 
                strokeWidth="1" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}