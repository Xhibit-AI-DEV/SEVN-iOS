import { Home, Plus, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

interface IOSBottomNavProps {
  activeTab?: 'home' | 'profile' | 'create';
}

export function IOSBottomNav({ activeTab }: IOSBottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from location if not explicitly provided
  const currentTab = activeTab || (
    location.pathname === '/' || location.pathname === '/home' ? 'home' :
    location.pathname === '/profile' ? 'profile' :
    location.pathname === '/create-edit' ? 'create' :
    'home'
  );

  const handleCreateClick = async () => {
    console.log('🎬 Create button clicked');
    
    // Check if running on native platform
    if (!Capacitor.isNativePlatform()) {
      console.log('🌐 Web platform - navigating to /create-edit');
      navigate('/create-edit');
      return;
    }

    console.log('📱 Native platform - opening camera picker');
    
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        promptLabelPhoto: 'Select from Photos',
        promptLabelPicture: 'Take Photo',
      });

      console.log('✅ Image selected:', image.webPath);

      if (image.webPath) {
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], `edit-${Date.now()}.${image.format}`, {
          type: `image/${image.format}`
        });

        navigate('/create-edit', {
          state: {
            mediaUrl: image.webPath,
            mediaFile: file,
            mediaType: 'image'
          }
        });
      }
    } catch (error) {
      console.error('❌ Error picking media:', error);
      const errorMessage = (error as Error).message;
      if (!errorMessage || !errorMessage.toLowerCase().includes('cancel')) {
        console.error('Error occurred:', error);
      } else {
        console.log('User cancelled photo selection');
      }
    }
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#1e1709]/10 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="max-w-[393px] mx-auto h-[50px] flex items-center justify-around px-8">
        {/* Home */}
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center gap-[2px] transition-all ${
            currentTab === 'home' ? '' : 'opacity-40'
          }`}
        >
          <Home 
            className="w-[26px] h-[26px]" 
            strokeWidth={currentTab === 'home' ? 2 : 1.5}
            fill={currentTab === 'home' ? '#1e1709' : 'none'}
          />
          <span className="text-[10px] tracking-[0.3px] font-['Helvetica_Neue:Medium',sans-serif] text-[#1e1709]">
            Home
          </span>
        </button>

        {/* Create */}
        <button
          onClick={handleCreateClick}
          className={`flex flex-col items-center gap-[2px] transition-all ${
            currentTab === 'create' ? '' : 'opacity-40'
          }`}
        >
          <Plus 
            className="w-[26px] h-[26px]" 
            strokeWidth={currentTab === 'create' ? 2 : 1.5}
          />
          <span className="text-[10px] tracking-[0.3px] font-['Helvetica_Neue:Medium',sans-serif] text-[#1e1709]">
            Create
          </span>
        </button>

        {/* Profile */}
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-[2px] transition-all ${
            currentTab === 'profile' ? '' : 'opacity-40'
          }`}
        >
          <User 
            className="w-[26px] h-[26px]" 
            strokeWidth={currentTab === 'profile' ? 2 : 1.5}
            fill={currentTab === 'profile' ? '#1e1709' : 'none'}
          />
          <span className="text-[10px] tracking-[0.3px] font-['Helvetica_Neue:Medium',sans-serif] text-[#1e1709]">
            Profile
          </span>
        </button>
      </div>
    </div>
  );
}