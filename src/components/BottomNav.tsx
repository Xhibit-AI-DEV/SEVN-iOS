import { Home, Plus, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#1e1709]/20 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="max-w-[393px] mx-auto h-[60px] flex items-center justify-around px-8">
        {/* Home */}
        <button
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center gap-1 transition-opacity ${
            location.pathname === '/home' || location.pathname === '/' ? 'opacity-100' : 'opacity-40'
          }`}
        >
          <Home className="w-6 h-6" strokeWidth={1.5} />
          <span className="text-[10px] tracking-[0.5px] uppercase font-['Helvetica_Neue:Regular',sans-serif]">
            Home
          </span>
        </button>

        {/* Create (Plus) */}
        <button
          onClick={() => navigate('/create-edit')}
          className="flex flex-col items-center gap-1 transition-opacity opacity-40 hover:opacity-100"
        >
          <Plus className="w-6 h-6" strokeWidth={1.5} />
          <span className="text-[10px] tracking-[0.5px] uppercase font-['Helvetica_Neue:Regular',sans-serif]">
            Create
          </span>
        </button>

        {/* Profile */}
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 transition-opacity ${
            location.pathname === '/profile' ? 'opacity-100' : 'opacity-40'
          }`}
        >
          <User className="w-6 h-6" strokeWidth={1.5} />
          <span className="text-[10px] tracking-[0.5px] uppercase font-['Helvetica_Neue:Regular',sans-serif]">
            Profile
          </span>
        </button>
      </div>
    </div>
  );
}