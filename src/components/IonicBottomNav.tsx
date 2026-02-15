import { Home, Plus, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export function IonicBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCreateClick = async () => {
    console.log('🎬 Create button clicked');
    console.log('📍 Platform check:', Capacitor.getPlatform());
    console.log('🤖 Is native?', Capacitor.isNativePlatform());
    
    // Check if running on native platform
    if (!Capacitor.isNativePlatform()) {
      console.log('🌐 Web platform - navigating to /create-edit');
      navigate('/create-edit');
      return;
    }

    console.log('📱 Native platform - opening camera picker');
    
    try {
      // Request permissions explicitly
      console.log('🔑 Requesting photo permissions...');
      const permissionStatus = await CapacitorCamera.checkPermissions();
      console.log('📋 Current permissions:', permissionStatus);
      
      if (permissionStatus.photos === 'denied') {
        console.error('❌ Photo permissions denied');
        alert('Photo permissions are required. Please enable them in Settings.');
        return;
      }
      
      if (permissionStatus.photos === 'prompt' || permissionStatus.photos === 'prompt-with-rationale') {
        console.log('📸 Requesting photo permissions...');
        const requestResult = await CapacitorCamera.requestPermissions({ permissions: ['photos'] });
        console.log('✅ Permission request result:', requestResult);
        
        if (requestResult.photos === 'denied') {
          console.error('❌ User denied photo permissions');
          alert('Photo permissions are required to create edits.');
          return;
        }
      }
      
      console.log('📸 Opening camera picker...');
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

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname === path;
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#1e1709]/10 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="max-w-[393px] mx-auto h-[50px] flex items-center justify-around">
        {/* Home Tab */}
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center justify-center gap-[2px] min-w-[60px] transition-opacity"
          style={{ opacity: isActive('/') ? 1 : 0.4 }}
        >
          <Home 
            className="w-[24px] h-[24px]" 
            strokeWidth={isActive('/') ? 2 : 1.5}
            fill={isActive('/') ? '#1e1709' : 'none'}
            stroke="#1e1709"
          />
          <span className="text-[10px] font-['Helvetica_Neue:Regular',sans-serif] text-[#1e1709]">
            Home
          </span>
        </button>

        {/* Create Tab */}
        <button
          onClick={handleCreateClick}
          className="flex flex-col items-center justify-center gap-[2px] min-w-[60px] transition-opacity"
          style={{ opacity: isActive('/create-edit') ? 1 : 0.4 }}
        >
          <Plus 
            className="w-[24px] h-[24px]" 
            strokeWidth={isActive('/create-edit') ? 2 : 1.5}
            stroke="#1e1709"
          />
          <span className="text-[10px] font-['Helvetica_Neue:Regular',sans-serif] text-[#1e1709]">
            Create
          </span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center justify-center gap-[2px] min-w-[60px] transition-opacity"
          style={{ opacity: isActive('/profile') ? 1 : 0.4 }}
        >
          <User 
            className="w-[24px] h-[24px]" 
            strokeWidth={isActive('/profile') ? 2 : 1.5}
            fill={isActive('/profile') ? '#1e1709' : 'none'}
            stroke="#1e1709"
          />
          <span className="text-[10px] font-['Helvetica_Neue:Regular',sans-serif] text-[#1e1709]">
            Profile
          </span>
        </button>
      </div>
    </div>
  );
}