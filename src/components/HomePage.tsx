import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BottomNavigation } from './BottomNavigation';
import { MoreMenuModal } from './MoreMenuModal';
import { HomePageBanner } from './HomePageBanner';
import { Heart } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';

// Import stylist images - must import as variables, NOT strings
import imgLissyRoddy from "figma:asset/21ead93bac0da68ed5f33efdfb07c0bf632228cc.png";
import imgValDrozg1 from "figma:asset/4b4531903296dd337e2503bb17f59748fdc6c9ee.png";
import imgValDrozg2 from "figma:asset/20128333cc3dc0dc5a9ed76f88c9c981a3185bd7.png";
import imgValDrozg3 from "figma:asset/e0a9d1b58aed482da9011bb5f685dc39e3501d17.png";
import imgChrisWhyle from "figma:asset/083df4dc1c94d586d53c3644182d81e287c70454.png";
import imgLewisBloyce from "figma:asset/9cffcde461e169a56491d6b656c1a87f1cc6898f.png";
import imgV22Logo from "figma:asset/4ec03ff54a95119f5d32d5425296f54905e0e776.png";
import imgChrisEdit from "figma:asset/d6d0374d1209d254e69a363bf2bd48de2a8fd831.png";
import imgLissyEdit from "figma:asset/5301c6e1e005f08fe75d30911849e67eca98064e.png";

export default function HomePage() {
  const navigate = useNavigate();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [profilesSeeded, setProfilesSeeded] = useState(false);

  // Auto-seed Chris and Lissy's profiles on mount
  useEffect(() => {
    const seedStylistProfiles = async () => {
      try {
        console.log('🌱 Auto-seeding stylist profiles...');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/seed-chris-account`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Stylist profiles seeded:', data);
          setProfilesSeeded(true);
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to seed profiles:', response.status, errorText);
        }
      } catch (error) {
        console.error('❌ Error seeding profiles:', error);
        console.error('❌ Error details:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
        });
      }
    };
    
    seedStylistProfiles();
  }, [profilesSeeded]);

  // Navigate to profile by username - fetches userId first
  const navigateToProfile = async (username: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/profiles/username/${username}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const userId = data.profile?.auth_user_id || data.profile?.user_id;
        if (userId) {
          navigate(`/profile/${userId}`);
        } else {
          console.error('❌ No user_id found in profile');
        }
      } else {
        console.error('❌ Profile not found for username:', username);
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
    }
  };

  const handleLogout = async () => {
    console.log('🚪 Logging out...');
    
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      console.log('✅ Supabase sign out successful');
    } catch (error) {
      console.error('❌ Supabase sign out error:', error);
    }
    
    // Clear everything
    localStorage.clear();
    sessionStorage.clear();
    
    // Navigate to signin
    navigate('/signin');
    
    // Force reload to ensure clean state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="h-full flex flex-col bg-[#fffefd] relative">
      {/* Fixed Header - 48px - Mobile Constrained */}
      <div className="w-full h-[48px] flex items-center justify-between px-4 bg-white border-b border-[#1e1709] shrink-0 max-w-[393px] mx-auto">
        <div className="flex items-center gap-2">
          <img 
            src={imgV22Logo} 
            alt="V22" 
            className="h-[34px] w-auto object-contain"
          />
          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[24px] tracking-[3px] text-black">
            SEVN
          </p>
        </div>
        <button 
          onClick={() => setShowMoreMenu(true)}
          className="w-6 h-6 flex items-center justify-center"
        >
          <Menu className="w-6 h-6 text-[#1e1709]" strokeWidth={1.1} />
        </button>
      </div>

      {/* Homepage Banner - Shows for invited/completed orders */}
      <HomePageBanner />

      {/* Scrollable Content - flex: 1 - Mobile Constrained */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden relative max-w-[393px] mx-auto w-full"
        style={{
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 'calc(50px + var(--safe-bottom))',
          zIndex: 1,
        }}
      >
        {/* FEATURED STYLISTS Section */}
        <div className="mb-4 mt-4">
          <h2 className="font-['Helvetica_Neue:Light',sans-serif] text-[16px] tracking-[3px] text-[#1e1709] uppercase mb-4 leading-[22px] px-4">
            FEATURED STYLISTS
          </h2>
          
          {/* Horizontal scroll of stylist cards - FULL BLEED */}
          <div 
            className="flex gap-3 overflow-x-auto overflow-y-visible pb-2 pl-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" 
            style={{ 
              scrollSnapType: 'none', 
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* First Featured Stylist - LISSY RODDY */}
            <button 
              className="relative shrink-0 size-[225px] rounded-[1px]"
              onClick={() => navigate('/lissy')}
              style={{ border: '1px solid #1e1709' }}
            >
              {/* Layered circular images */}
              <div className="absolute inset-[5.05%_4.71%_4.69%_4.71%] pointer-events-none rounded-[147px]">
                <ImageWithFallback 
                  alt="Lissy Roddy" 
                  loading="lazy" 
                  className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" 
                  src={imgLissyRoddy} 
                />
                <ImageWithFallback 
                  alt="Lissy Roddy" 
                  loading="lazy" 
                  className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" 
                  src={imgLissyRoddy} 
                />
                <ImageWithFallback 
                  alt="Lissy Roddy" 
                  loading="lazy" 
                  className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" 
                  src={imgLissyRoddy} 
                />
                <div className="absolute inset-0 rounded-[147px]" style={{ border: '1px solid #EAEAEA' }} />
              </div>
              
              {/* Name badge */}
              <div className="absolute inset-[80%_5.97%_9.26%_6.11%]">
                <div className="absolute bg-[rgba(255,254,253,0.8)] inset-0 rounded-[8px]" style={{ border: '1px solid #1e1709' }} />
                <div className="absolute flex flex-col font-['Helvetica_Neue:Regular',sans-serif] inset-[0_0_0_0] justify-center items-center leading-[14px] text-[#1e1709] text-[12px] tracking-[0.5px] uppercase">
                  <p>LISSY RODDY</p>
                </div>
              </div>
            </button>

            {/* Second Featured Stylist - VAL DROZG */}
            <div className="relative shrink-0 size-[225px] rounded-[1px]" style={{ border: '1px solid #1e1709' }}>
              {/* Layered circular images */}
              <div className="absolute inset-[5.05%_4.71%_4.69%_4.71%] pointer-events-none rounded-[147px]">
                <ImageWithFallback 
                  alt="Val Drozg" 
                  loading="lazy" 
                  className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" 
                  src={imgValDrozg1} 
                />
                <ImageWithFallback 
                  alt="Val Drozg" 
                  loading="lazy" 
                  className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" 
                  src={imgValDrozg2} 
                />
                <ImageWithFallback 
                  alt="Val Drozg" 
                  loading="lazy" 
                  className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" 
                  src={imgValDrozg3} 
                />
                <div className="absolute inset-0 rounded-[147px]" style={{ border: '1px solid #EAEAEA' }} />
              </div>
              
              {/* Name badge */}
              <div className="absolute inset-[80%_5.97%_9.26%_6.11%]">
                <div className="absolute bg-[rgba(255,254,253,0.8)] inset-0 rounded-[8px]" style={{ border: '1px solid #1e1709' }} />
                <div className="absolute flex flex-col font-['Helvetica_Neue:Regular',sans-serif] inset-[0_0_0_0] justify-center items-center leading-[14px] text-[#1e1709] text-[12px] tracking-[0.5px] uppercase">
                  <p>VAL DROZG</p>
                </div>
              </div>
            </div>

            {/* Third Featured Stylist - CHRIS WHYLE */}
            <button 
              className="relative shrink-0 size-[225px] rounded-[1px]"
              onClick={() => navigate('/chris')}
              style={{ border: '1px solid #1e1709' }}
            >
              {/* Layered circular images */}
              <div className="absolute inset-[5.05%_4.71%_4.69%_4.71%] pointer-events-none rounded-[147px]">
                <ImageWithFallback 
                  alt="Chris Whyle" 
                  loading="lazy" 
                  className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" 
                  src={imgChrisWhyle} 
                />
                <ImageWithFallback 
                  alt="Chris Whyle" 
                  loading="lazy" 
                  className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" 
                  src={imgChrisWhyle} 
                />
                <ImageWithFallback 
                  alt="Chris Whyle" 
                  loading="lazy" 
                  className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" 
                  src={imgChrisWhyle} 
                />
                <div className="absolute inset-0 rounded-[147px]" style={{ border: '1px solid #EAEAEA' }} />
              </div>
              
              {/* Name badge */}
              <div className="absolute inset-[80%_5.97%_9.26%_6.11%]">
                <div className="absolute bg-[rgba(255,254,253,0.8)] inset-0 rounded-[8px]" style={{ border: '1px solid #1e1709' }} />
                <div className="absolute flex flex-col font-['Helvetica_Neue:Regular',sans-serif] inset-[0_0_0_0] justify-center items-center leading-[14px] text-[#1e1709] text-[12px] tracking-[0.5px] uppercase">
                  <p>CHRIS WHLY</p>
                </div>
              </div>
            </button>

            {/* Fourth Featured Stylist - LEWIS BLOYCE */}
            <button 
              className="relative shrink-0 size-[225px] rounded-[1px] mr-4"
              onClick={() => navigate('/lewis')}
              style={{ border: '1px solid #1e1709' }}
            >
              {/* Layered circular images */}
              <div className="absolute inset-[5.05%_4.71%_4.69%_4.71%] pointer-events-none rounded-[147px]">
                <ImageWithFallback 
                  alt="Lewis Bloyce" 
                  loading="lazy" 
                  className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" 
                  src={imgLewisBloyce} 
                />
                <ImageWithFallback 
                  alt="Lewis Bloyce" 
                  loading="lazy" 
                  className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" 
                  src={imgLewisBloyce} 
                />
                <ImageWithFallback 
                  alt="Lewis Bloyce" 
                  loading="lazy" 
                  className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" 
                  src={imgLewisBloyce} 
                />
                <div className="absolute inset-0 rounded-[147px]" style={{ border: '1px solid #EAEAEA' }} />
              </div>
              
              {/* Name badge */}
              <div className="absolute inset-[80%_5.97%_9.26%_6.11%]">
                <div className="absolute bg-[rgba(255,254,253,0.8)] inset-0 rounded-[8px]" style={{ border: '1px solid #1e1709' }} />
                <div className="absolute flex flex-col font-['Helvetica_Neue:Regular',sans-serif] inset-[0_0_0_0] justify-center items-center leading-[14px] text-[#1e1709] text-[12px] tracking-[0.5px] uppercase">
                  <p>LEWIS BLOYCE</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* CURATED EDITS Section */}
        <div className="mb-4">
          <h2 className="font-['Helvetica_Neue:Light',sans-serif] text-[16px] tracking-[3px] text-[#1e1709] uppercase mb-4 leading-[22px] px-4">
            CURATED EDITS
          </h2>
          
          {/* Horizontal scroll of edit cards - FULL BLEED */}
          <div 
            className="flex gap-3 overflow-x-auto overflow-y-visible pb-2 pl-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" 
            style={{ 
              scrollSnapType: 'none', 
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* Chris Whyle Edit Card */}
            <div 
              className="relative shrink-0 w-[361px] h-[543px]"
              data-name="Card/Lookbook/Big"
            >
              {/* Triple border layers */}
              <div className="absolute border border-[#1e1709] inset-[3px] opacity-80 rounded-[8px]" />
              <div className="absolute border border-[#1e1709] inset-[6px_0_0_6px] rounded-[8px]" />
              
              {/* Main image */}
              <div className="absolute inset-[0_6px_6px_0] overflow-hidden rounded-[8px]">
                <img alt="" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" src={imgChrisEdit} />
                <div className="absolute border border-[#1e1709] inset-0 rounded-[8px]" />
              </div>
              
              {/* Name badge - bottom left */}
              <button 
                onClick={() => navigateToProfile('chris_whly')}
                className="absolute bottom-[16px] left-[16px] z-10"
              >
                <div className="bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] px-[14px] h-[30px] flex items-center justify-center">
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709] tracking-[1px] uppercase leading-[22px]">
                    CHRIS WHLY
                  </p>
                </div>
              </button>
              
              {/* Heart icon - top right */}
              <button className="absolute top-[12px] right-[16px] z-10">
                <div className="relative w-[36.3px] h-[33.871px]">
                  <div className="absolute bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] inset-0" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Heart 
                      className="w-[16px] h-[16px]" 
                      fill="none"
                      stroke="#1E1709"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </button>
            </div>

            {/* Lissy Roddy Edit Card */}
            <div 
              className="relative shrink-0 w-[361px] h-[543px] mr-4"
              data-name="Card/Lookbook/Big"
            >
              {/* Triple border layers */}
              <div className="absolute border border-[#1e1709] inset-[3px] opacity-80 rounded-[8px]" />
              <div className="absolute border border-[#1e1709] inset-[6px_0_0_6px] rounded-[8px]" />
              
              {/* Main image */}
              <div className="absolute inset-[0_6px_6px_0] overflow-hidden rounded-[8px]">
                <img alt="" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" src={imgLissyEdit} />
                <div className="absolute border border-[#1e1709] inset-0 rounded-[8px]" />
              </div>
              
              {/* Name badge - bottom left */}
              <button 
                onClick={() => navigateToProfile('lissy')}
                className="absolute bottom-[16px] left-[16px] z-10"
              >
                <div className="bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] px-[14px] h-[30px] flex items-center justify-center">
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709] tracking-[1px] uppercase leading-[22px]">
                    LISSY RODDY
                  </p>
                </div>
              </button>
              
              {/* Heart icon - top right */}
              <button className="absolute top-[12px] right-[16px] z-10">
                <div className="relative w-[36.3px] h-[33.871px]">
                  <div className="absolute bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] inset-0" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Heart 
                      className="w-[16px] h-[16px]" 
                      fill="none"
                      stroke="#1E1709"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed Bottom Navigation */}
      <BottomNavigation />
      
      {/* More Menu Modal */}
      <MoreMenuModal 
        isOpen={showMoreMenu} 
        onClose={() => setShowMoreMenu(false)}
        isOwnProfile={true}
        onLogout={handleLogout}
      />
    </div>
  );
}