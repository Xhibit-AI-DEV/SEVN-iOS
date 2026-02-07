import { BottomNavigation } from './BottomNavigation';
import { useNavigate } from 'react-router';
import { Menu } from 'lucide-react';
import svgPaths from "../imports/svg-d2gyhsl728";
import imgScreenshot20231117At12528 from "figma:asset/4b4531903296dd337e2503bb17f59748fdc6c9ee.png";
import imgScreenshot20231117At12529 from "figma:asset/fecf94a9418e54b88d39fd7f742c93a62efe3681.png";
import imgScreenshot20231117At12524 from "figma:asset/557e4ca658e2ff37cf2dda18e4534c106ec861c0.png";
import imgScreenshot20231117At12525 from "figma:asset/e4b87ad125820c87df00cd6e705bde4e8af3e67e.png";
import imgScreenshot20231117At12530 from "figma:asset/20128333cc3dc0dc5a9ed76f88c9c981a3185bd7.png";
import imgScreenshot20231117At12531 from "figma:asset/e0a9d1b58aed482da9011bb5f685dc39e3501d17.png";
import imgLissyRoddy from "figma:asset/21ead93bac0da68ed5f33efdfb07c0bf632228cc.png";
import img021 from "figma:asset/e848b14a74d352089a614d152282f09191ed8fc0.png";
import img22 from "figma:asset/9f1f3c2c66a18611ca3dc256be40c92f256300b5.png";
import img23 from "figma:asset/2100215bdb3f74706b3cf7fa51529271f7ee431e.png";
import img24 from "figma:asset/ffd0a0d7d582101431a5f08c43e5cca5e4dedd59.png";
import img from "figma:asset/7ba87817f8223271b091058d7d6c574cf1ba0452.png";
import imgShareIcon from "figma:asset/acdcb062503544d45e9ec42f141e5eaf2bc04359.png";
import imgChrisWhyle from "figma:asset/083df4dc1c94d586d53c3644182d81e287c70454.png";
import imgChrisEdit from "figma:asset/d6d0374d1209d254e69a363bf2bd48de2a8fd831.png";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[#fffefd]">
      {/* Header - VII SEVN on left, hamburger on right */}
      <div className="bg-white h-[48px] w-full relative">
        <div className="h-full flex items-center justify-between px-4 mx-auto">
          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[24px] tracking-[3px] text-black">
            VII SEVN
          </p>
          <button className="w-6 h-6 flex items-center justify-center">
            <Menu className="w-6 h-6 text-[#1e1709]" strokeWidth={1.1} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="w-full mx-auto overflow-y-auto pb-24 pt-4">
        {/* FEATURED STYLISTS Section */}
        <div className="px-4 mb-4">
          <h2 className="font-['Helvetica_Neue:Light',sans-serif] text-[16px] tracking-[3px] text-[#1e1709] uppercase mb-4 leading-[22px]">
            FEATURED STYLISTS
          </h2>
          
          {/* Horizontal scroll of stylist cards */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ scrollSnapType: 'none', WebkitOverflowScrolling: 'touch' }}>
            {/* First Featured Stylist - LISSY RODDY */}
            <button 
              className="relative shrink-0 size-[225px] border border-black/50 rounded-[1px]"
              onClick={() => navigate('/lissy')}
              style={{ borderWidth: '1px' }}
            >
              {/* Circular image */}
              <div className="absolute inset-[5.05%_4.71%_4.69%_4.71%] pointer-events-none rounded-[147px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" src={imgLissyRoddy} />
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
            <div className="relative shrink-0 size-[225px] border border-black/50 rounded-[1px]" style={{ borderWidth: '1px' }}>
              {/* Layered circular images */}
              <div className="absolute inset-[5.05%_4.71%_4.69%_4.71%] pointer-events-none rounded-[147px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" src={imgScreenshot20231117At12528} />
                <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" src={imgScreenshot20231117At12530} />
                <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" src={imgScreenshot20231117At12531} />
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
              className="relative shrink-0 size-[225px] border border-black/50 rounded-[1px]"
              onClick={() => navigate('/chris')}
              style={{ borderWidth: '1px' }}
            >
              {/* Layered circular images */}
              <div className="absolute inset-[5.05%_4.71%_4.69%_4.71%] pointer-events-none rounded-[147px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[147px] size-full" src={imgChrisWhyle} />
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
          </div>
        </div>

        {/* CURATED EDITS Section */}
        <div className="px-4">
          <h2 className="font-['Helvetica_Neue:Light',sans-serif] text-[16px] tracking-[3px] text-[#1e1709] uppercase mb-4 leading-[22px]">
            CURATED EDITS
          </h2>
          
          {/* Vertical feed of cards - using ProfilePage design */}
          <div className="flex flex-col gap-[8px]">
            {/* CHRIS WHLY Card 2 - New Image */}
            <div className="relative shrink-0 w-full max-w-[363px] h-[543px]">
              {/* Triple border effect with 4px spacing */}
              <div className="absolute border border-[#1e1709] inset-[4px] opacity-80 rounded-[8px]" />
              <div className="absolute border border-[#1e1709] inset-[8px_0_0_8px] rounded-[8px]" />
              
              {/* Main image container with border */}
              <div className="absolute inset-[0_8px_8px_0] rounded-[8px]">
                {/* Main image */}
                <div className="absolute inset-0 rounded-[8px]">
                  <img 
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover rounded-[8px]"
                    src={imgChrisEdit}
                  />
                </div>
                
                {/* Black gradient overlay - bottom 30% */}
                <div className="absolute bottom-0 left-0 right-0 h-[30%] rounded-b-[8px]" style={{ background: 'linear-gradient(to top, rgba(0, 0, 0, 0.35), transparent)' }} />
                
                {/* Border on top */}
                <div className="absolute border border-[#1e1709] inset-0 rounded-[8px] pointer-events-none" />
                
                {/* Name label with pill background */}
                <button 
                  className="absolute bottom-[16px] left-[16px] z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/u/chris_whly');
                  }}
                >
                  <div className="px-3 py-1.5 rounded-full border border-[#1e1709] hover:bg-white/95 transition-colors" style={{ backgroundColor: 'rgba(255,254,253,0.85)' }}>
                    <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709] tracking-[0.5px] leading-[16px] uppercase">
                      CHRIS WHLY
                    </p>
                  </div>
                </button>
              </div>
              
              {/* Heart icon */}
              <div className="absolute top-[12px] right-[18px] z-10">
                <div className="relative w-[36px] h-[36px]">
                  <div className="absolute rounded-full inset-0" style={{ backgroundColor: 'rgba(255,254,253,0.85)' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24">
                      <path 
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                        stroke="#1E1709" 
                        strokeWidth="1.5" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNavigation activeTab="discover" />
      </div>
    </div>
  );
}