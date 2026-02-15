import { Home, Plus, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname === path;
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#1e1709]/10"
      style={{
        height: 'calc(50px + var(--safe-bottom))',
        paddingBottom: 'var(--safe-bottom)',
        pointerEvents: 'auto',
        zIndex: 10000,
        position: 'fixed',
      }}
    >
      <div className="max-w-[393px] mx-auto h-[50px] flex items-center justify-around">
        {/* Home Tab */}
        <button
          onClick={() => {
            console.log('🏠 Home clicked');
            navigate('/');
          }}
          className="flex flex-col items-center justify-center gap-[2px] min-w-[60px] transition-opacity"
          style={{ opacity: isActive('/') ? 1 : 0.4 }}
        >
          <Home 
            className="w-[24px] h-[24px]" 
            strokeWidth={1}
            fill={isActive('/') ? '#1e1709' : 'none'}
            stroke="#1e1709"
          />
          <span className="text-[10px] font-['Helvetica_Neue:Regular',sans-serif] text-[#1e1709]">
            Home
          </span>
        </button>

        {/* Create Tab */}
        <button
          onClick={() => {
            console.log('➕ Create clicked - navigating to /create-edit');
            navigate('/create-edit');
          }}
          className="flex flex-col items-center justify-center gap-[2px] min-w-[60px] transition-opacity"
          style={{ opacity: isActive('/create-edit') ? 1 : 0.4 }}
        >
          <Plus 
            className="w-[24px] h-[24px]" 
            strokeWidth={1}
            stroke="#1e1709"
          />
          <span className="text-[10px] font-['Helvetica_Neue:Regular',sans-serif] text-[#1e1709]">
            Create
          </span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => {
            console.log('👤 Profile clicked');
            navigate('/profile');
          }}
          className="flex flex-col items-center justify-center gap-[2px] min-w-[60px] transition-opacity"
          style={{ opacity: isActive('/profile') ? 1 : 0.4 }}
        >
          <User 
            className="w-[24px] h-[24px]" 
            strokeWidth={1}
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