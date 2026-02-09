import { useNavigate } from 'react-router';
import { BottomNavigation } from './BottomNavigation';
import svgPaths from "../imports/svg-2i8s6kgsq9";
import imgScreenshot20231117At12528 from "figma:asset/4b4531903296dd337e2503bb17f59748fdc6c9ee.png";
import imgScreenshot20231117At12529 from "figma:asset/fecf94a9418e54b88d39fd7f742c93a62efe3681.png";
import imgScreenshot20231117At12524 from "figma:asset/557e4ca658e2ff37cf2dda18e4534c106ec861c0.png";
import imgScreenshot20231117At12525 from "figma:asset/e4b87ad125820c87df00cd6e705bde4e8af3e67e.png";
import imgScreenshot20231117At12530 from "figma:asset/20128333cc3dc0dc5a9ed76f88c9c981a3185bd7.png";
import imgEllipse2 from "figma:asset/f2ca5ebc3cc3b3b3cd76d741dc18b557f3c97742.png";
import imgEllipse3 from "figma:asset/439705f87c1f1b1a7f7248d6ab68088bed32a71d.png";
import imgScreenshot20231117At12531 from "figma:asset/e0a9d1b58aed482da9011bb5f685dc39e3501d17.png";
import imgScreenshot20231117At12532 from "figma:asset/60d881796e3fd37544a1e0ed86bd42f2b8e270f7.png";
import imgEllipse1 from "figma:asset/48e1568ab63aa8a6aab7981b5404c32eb926571e.png";
import img021 from "figma:asset/e848b14a74d352089a614d152282f09191ed8fc0.png";
import img22 from "figma:asset/9f1f3c2c66a18611ca3dc256be40c92f256300b5.png";
import img23 from "figma:asset/2100215bdb3f74706b3cf7fa51529271f7ee431e.png";
import img24 from "figma:asset/ffd0a0d7d582101431a5f08c43e5cca5e4dedd59.png";

export function StylistsPage() {
  const navigate = useNavigate();

  return (
    <div 
      className="relative w-full min-h-screen overflow-x-hidden bg-[#fffefd]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Header */}
      <div className="bg-white h-[135px] w-full px-4 relative">
        <div className="h-full flex items-start pt-5 max-w-[393px] mx-auto">
          {/* SEVN VII Logo Text */}
          <div className="flex items-center gap-2">
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[24px] tracking-[3px] text-black">
              SEVN
            </p>
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[24px] tracking-[3px] text-black">
              VII
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div 
        className="w-full max-w-[393px] mx-auto overflow-y-auto"
        style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}
      >
        {/* Featured Stylists Section */}
        <div className="flex flex-col gap-4 px-4 mb-6">
          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[20px] tracking-[3px] text-[#1e1709] uppercase">
            FEATURED STYLISTS
          </p>
          
          {/* Horizontal scroll of stylist cards */}
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Lissy Roddy Card */}
            <div className="relative shrink-0 w-[276px] h-[277px] border border-black">
              <div className="absolute inset-[5.05%_4.71%_4.69%_4.71%] rounded-[350px]">
                <img 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover rounded-[350px]" 
                  src={imgScreenshot20231117At12528} 
                />
                <img 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover rounded-[350px]" 
                  src={imgScreenshot20231117At12529} 
                />
                <div className="absolute border border-[#1e1709] inset-0 rounded-[350px]" />
              </div>
              
              <div className="absolute inset-[5.05%_4.71%_4.69%_3.99%] rounded-[360px]">
                <div className="absolute inset-0 pointer-events-none rounded-[360px]">
                  <img 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover rounded-[360px]" 
                    src={imgScreenshot20231117At12524} 
                  />
                  <img 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover rounded-[360px]" 
                    src={imgScreenshot20231117At12525} 
                  />
                </div>
              </div>
              
              {/* Name badge */}
              <div className="absolute bottom-[26px] left-1/2 -translate-x-1/2 w-auto">
                <div className="bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] h-[30px] px-4 flex items-center justify-center">
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709] tracking-[1px] uppercase">
                    LISSY RODDY
                  </p>
                </div>
              </div>
            </div>

            {/* Chris Whyle Card */}
            <div className="relative shrink-0 w-[276px] h-[277px] border border-black">
              <div className="absolute inset-[5.05%_4.71%_4.69%_4.71%] rounded-[350px]">
                <img 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover rounded-[350px]" 
                  src={imgScreenshot20231117At12528} 
                />
                <img 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover rounded-[350px]" 
                  src={imgScreenshot20231117At12530} 
                />
                <div className="absolute border border-[#1e1709] inset-0 rounded-[350px]" />
              </div>
              
              {/* Name badge */}
              <div className="absolute bottom-[26px] left-[11px] right-[22px]">
                <div className="bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] h-[30px] flex items-center justify-center">
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709] tracking-[1px] uppercase">
                    CHRIS WHLY
                  </p>
                </div>
              </div>
              
              {/* Share icon - top right */}
              <div className="absolute top-[15px] right-[22px]">
                <div className="relative w-[32px] h-[32px]">
                  <div className="absolute bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] inset-0" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-[12px] h-[12px]" fill="none" viewBox="0 0 13 13">
                      <path d="M12.5 0V3.5H0.5V0" stroke="#1E1709" strokeWidth="1" />
                      <path d="M6.5 10V3" stroke="#1E1709" strokeWidth="1" strokeLinecap="square" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Val Drozg Card */}
            <div className="relative shrink-0 w-[276px] h-[277px] border border-black">
              <div className="absolute inset-[5.05%_4.71%_4.69%_4.71%] rounded-[350px]">
                <img 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover rounded-[350px]" 
                  src={imgScreenshot20231117At12528} 
                />
                <img 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover rounded-[350px]" 
                  src={imgScreenshot20231117At12530} 
                />
                <img 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover rounded-[350px]" 
                  src={imgScreenshot20231117At12531} 
                />
                <div className="absolute border border-[#1e1709] inset-0 rounded-[350px]" />
              </div>
              
              {/* Name badge */}
              <div className="absolute bottom-[26px] left-[11px] right-[22px]">
                <div className="bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] h-[30px] flex items-center justify-center">
                  <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709] tracking-[1px] uppercase">
                    VAL.DRZ
                  </p>
                </div>
              </div>
              
              {/* Share icon - top right */}
              <div className="absolute top-[15px] right-[22px]">
                <div className="relative w-[32px] h-[32px]">
                  <div className="absolute bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] inset-0" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-[12px] h-[12px]" fill="none" viewBox="0 0 13 13">
                      <path d="M12.5 0V3.5H0.5V0" stroke="#1E1709" strokeWidth="1" />
                      <path d="M6.5 10V3" stroke="#1E1709" strokeWidth="1" strokeLinecap="square" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Edits Section */}
        <div className="flex flex-col gap-4 px-4">
          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[20px] tracking-[3px] text-[#1e1709] uppercase">
            FEATURED EDITS
          </p>
          
          {/* Horizontal scroll of edit cards */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* SUMMER XO / VAL.DRZ Card */}
            <div className="relative shrink-0 w-[361px] h-[543px]">
              {/* Triple border layers */}
              <div className="absolute border border-[#1e1709] inset-[3px] opacity-80 rounded-[8px]" />
              <div className="absolute border border-[#1e1709] inset-[6px_0_0_6px] rounded-[8px]" />
              
              {/* Main image container */}
              <div className="absolute inset-[0_6px_6px_0] rounded-[8px]">
                {/* Background images */}
                <div className="absolute inset-0 rounded-[8px]">
                  <img 
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover rounded-[8px]"
                    src={imgScreenshot20231117At12528}
                  />
                  <div className="absolute inset-0 overflow-hidden rounded-[8px]">
                    <img 
                      alt=""
                      className="absolute h-[120.16%] left-[-2.54%] top-[-4.17%] w-[111.88%]"
                      src={imgScreenshot20231117At12529}
                    />
                  </div>
                </div>
                
                {/* Overlay composite images */}
                <div className="absolute inset-0 rounded-[8px]">
                  <img alt="" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" src={img021} />
                  <img alt="" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" src={img22} />
                  <img alt="" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" src={img021} />
                  <img alt="" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" src={img24} />
                </div>
                
                {/* Border on top */}
                <div className="absolute border border-[#1e1709] inset-0 rounded-[8px] pointer-events-none" />
                
                {/* Stylist name badge - bottom left */}
                <div className="absolute bottom-[16px] left-[16px] z-10">
                  <div className="bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] px-[14px] h-[30px] flex items-center justify-center">
                    <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709] tracking-[1px] uppercase leading-[22px]">
                      VAL.DRZ
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Save icon - top right */}
              <div className="absolute top-[12px] right-[16px]">
                <div className="relative w-[36.3px] h-[33.871px]">
                  <div className="absolute bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] inset-0" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 14 18">
                      <path 
                        d="M1 1H13V17L7 13L1 17V1Z" 
                        stroke="#1E1709" 
                        strokeWidth="1.5" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Edit Card */}
            <div className="relative shrink-0 w-[361px] h-[543px]">
              {/* Triple border layers */}
              <div className="absolute border border-[#1e1709] inset-[3px] opacity-80 rounded-[8px]" />
              <div className="absolute border border-[#1e1709] inset-[6px_0_0_6px] rounded-[8px]" />
              
              {/* Main image container */}
              <div className="absolute inset-[0_6px_6px_0] rounded-[8px]">
                {/* Background images */}
                <div className="absolute inset-0 rounded-[8px]">
                  <img 
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover rounded-[8px]"
                    src={imgScreenshot20231117At12528}
                  />
                  <div className="absolute inset-0 overflow-hidden rounded-[8px]">
                    <img 
                      alt=""
                      className="absolute h-[120.16%] left-[-2.54%] top-[-4.17%] w-[111.88%]"
                      src={imgScreenshot20231117At12529}
                    />
                  </div>
                </div>
                
                {/* Overlay composite images */}
                <div className="absolute inset-0 rounded-[8px]">
                  <img alt="" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" src={img021} />
                  <img alt="" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" src={img22} />
                  <img alt="" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" src={img021} />
                  <img alt="" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" src={img23} />
                </div>
                
                {/* Border on top */}
                <div className="absolute border border-[#1e1709] inset-0 rounded-[8px] pointer-events-none" />
                
                {/* Stylist name badge - bottom left */}
                <div className="absolute bottom-[16px] left-[16px] z-10">
                  <div className="bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] px-[14px] h-[30px] flex items-center justify-center">
                    <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709] tracking-[1px] uppercase leading-[22px]">
                      CHRISWHYL
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Save icon - top right */}
              <div className="absolute top-[12px] right-[16px]">
                <div className="relative w-[36.3px] h-[33.871px]">
                  <div className="absolute bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] inset-0" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 14 18">
                      <path 
                        d="M1 1H13V17L7 13L1 17V1Z" 
                        stroke="#1E1709" 
                        strokeWidth="1.5" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Third Edit Card */}
            <div className="relative shrink-0 w-[361px] h-[543px]">
              {/* Triple border layers */}
              <div className="absolute border border-[#1e1709] inset-[3px] opacity-80 rounded-[8px]" />
              <div className="absolute border border-[#1e1709] inset-[6px_0_0_6px] rounded-[8px]" />
              
              {/* Main image container */}
              <div className="absolute inset-[0_6px_6px_0] rounded-[8px]">
                {/* Background images */}
                <div className="absolute inset-0 rounded-[8px]">
                  <img 
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover rounded-[8px]"
                    src={imgScreenshot20231117At12528}
                  />
                  <div className="absolute inset-0 overflow-hidden rounded-[8px]">
                    <img 
                      alt=""
                      className="absolute h-[120.16%] left-[-2.54%] top-[-4.17%] w-[111.88%]"
                      src={imgScreenshot20231117At12529}
                    />
                  </div>
                </div>
                
                {/* Overlay composite images */}
                <div className="absolute inset-0 rounded-[8px]">
                  <img alt="" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" src={img021} />
                  <img alt="" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" src={img22} />
                  <img alt="" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" src={img021} />
                  <img alt="" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" src={img24} />
                </div>
                
                {/* Border on top */}
                <div className="absolute border border-[#1e1709] inset-0 rounded-[8px] pointer-events-none" />
                
                {/* Stylist name badge - bottom left */}
                <div className="absolute bottom-[16px] left-[16px] z-10">
                  <div className="bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] px-[14px] h-[30px] flex items-center justify-center">
                    <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709] tracking-[1px] uppercase leading-[22px]">
                      VAL.DRZ
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Save icon - top right */}
              <div className="absolute top-[12px] right-[16px]">
                <div className="relative w-[36.3px] h-[33.871px]">
                  <div className="absolute bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] inset-0" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 14 18">
                      <path 
                        d="M1 1H13V17L7 13L1 17V1Z" 
                        stroke="#1E1709" 
                        strokeWidth="1.5" 
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
        <BottomNavigation />
      </div>
    </div>
  );
}