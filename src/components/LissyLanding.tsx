import { useState, useRef } from 'react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useNavigate } from 'react-router';
import svgPaths from "../imports/svg-ixy1f48tju";
import imgLissyRoddy from "figma:asset/21ead93bac0da68ed5f33efdfb07c0bf632228cc.png";
import imgScreenshot20231117At12528 from "figma:asset/4b4531903296dd337e2503bb17f59748fdc6c9ee.png";
import imgScreenshot20231117At12529 from "figma:asset/7ba87817f8223271b091058d7d6c574cf1ba0452.png";
import img021 from "figma:asset/e848b14a74d352089a614d152282f09191ed8fc0.png";
import imgShareIcon from "figma:asset/acdcb062503544d45e9ec42f141e5eaf2bc04359.png";

interface LissyLandingProps {
  onImageUpload: (file: File) => void;
}

function RightSide() {
  return (
    <div className="absolute h-[9.932px] left-[calc(83.33%+17.41px)] top-[12px] translate-x-[-50%] w-[57.824px]" data-name="Right Side">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 57.8244 9.93217">
        <g id="Right Side">
          <g id="Battery">
            <path d={svgPaths.p1982f500} id="Rectangle" stroke="var(--stroke-0, black)" strokeWidth="0.876124" />
            <path d={svgPaths.p6f30100} fill="var(--fill-0, black)" id="Combined Shape" />
            <path d={svgPaths.p252af00} fill="var(--fill-0, black)" id="Rectangle_2" />
          </g>
          <path clipRule="evenodd" d={svgPaths.p2c1300} fill="var(--fill-0, black)" fillRule="evenodd" id="Wifi" />
          <path clipRule="evenodd" d={svgPaths.p1bb55300} fill="var(--fill-0, black)" fillRule="evenodd" id="Mobile Signal" />
        </g>
      </svg>
    </div>
  );
}

function LeftSide() {
  return (
    <div className="absolute contents left-[16px] top-1/2 translate-y-[-50%]" data-name="Left Side">
      <p className="absolute css-ew64yg font-['Oswald:Medium',sans-serif] font-medium leading-[17.522px] left-[26.5px] text-[13.142px] text-black text-center top-[calc(50%-9px)] tracking-[-0.4381px] translate-x-[-50%]">9:41</p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[16px] top-[8px]">
      <RightSide />
      <LeftSide />
    </div>
  );
}

function StatusBarIPhone1313Pro() {
  return (
    <div className="absolute h-[34px] left-0 overflow-clip top-0 w-[375px]" data-name="StatusBar / iPhone 13 & 13 Pro">
      <Group />
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Frame">
          <path d={svgPaths.p399a4e80} fill="var(--fill-0, black)" fillOpacity="0.5" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0">
      <Frame />
      <p className="css-ew64yg font-['Helvetica_Neue:Regular',sans-serif] leading-[1.3] not-italic relative shrink-0 text-[12px] text-[rgba(30,23,9,0.5)]">Discover</p>
    </div>
  );
}

function Frame10() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center px-[41px] py-[4px] relative w-full">
          <Frame5 />
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Frame">
          <path d={svgPaths.p1988b600} fill="var(--fill-0, #1E1709)" fillOpacity="0.5" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0">
      <Frame1 />
      <p className="css-ew64yg font-['Helvetica_Neue:Regular',sans-serif] leading-[1.3] not-italic relative shrink-0 text-[12px] text-[rgba(30,23,9,0.5)]">Feed</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center px-[41px] py-[4px] relative w-full">
          <Frame7 />
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Frame">
          <path d={svgPaths.p13d1e8f0} fill="var(--fill-0, #1E1709)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0">
      <Frame2 />
      <p className="css-ew64yg font-['Helvetica_Neue:Regular',sans-serif] leading-[1.3] not-italic relative shrink-0 text-[#1e1709] text-[12px]">Create</p>
    </div>
  );
}

function Frame12() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center px-[41px] py-[4px] relative w-full">
          <Frame11 />
        </div>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Frame">
          <path d={svgPaths.p1f44c800} fill="var(--fill-0, #1E1709)" fillOpacity="0.5" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0">
      <Frame3 />
      <p className="css-ew64yg font-['Helvetica_Neue:Regular',sans-serif] leading-[1.3] not-italic relative shrink-0 text-[12px] text-[rgba(30,23,9,0.5)]">Collection</p>
    </div>
  );
}

function Frame9() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center px-[41px] py-[4px] relative w-full">
          <Frame13 />
        </div>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Frame">
          <path d={svgPaths.p4860600} fill="var(--fill-0, #1E1709)" fillOpacity="0.5" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0">
      <Frame4 />
      <p className="css-ew64yg font-['Helvetica_Neue:Regular',sans-serif] leading-[1.3] not-italic relative shrink-0 text-[12px] text-[rgba(30,23,9,0.5)]">Profile</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center px-[41px] py-[4px] relative w-full">
          <Frame14 />
        </div>
      </div>
    </div>
  );
}

function Frame15() {
  return (
    <div className="bg-white relative shadow-[0px_-6px_8px_0px_rgba(0,0,0,0.05)] shrink-0 w-full">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[16px] items-center justify-center px-[12px] py-[8px] relative w-full">
          <Frame10 />
          <Frame6 />
          <Frame12 />
          <Frame9 />
          <Frame8 />
        </div>
      </div>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Home Indicator">
      <div className="absolute bg-black bottom-[7.02px] h-[4.39px] left-[calc(50%+0.32px)] rounded-[87.797px] translate-x-[-50%] w-[117.648px]" data-name="Home Indicator" />
    </div>
  );
}

function Frame16() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col items-start left-0 w-[375px]">
      <Frame15 />
      <HomeIndicator />
    </div>
  );
}

function Create() {
  return (
    <div className="absolute bg-white h-[1050px] left-[3px] overflow-clip top-0 w-[390px]" data-name="Create">
      {/* Status bar removed */}
      <div className="absolute h-0 left-[21px] top-[551px] w-[349px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 349 1">
            <line id="Line 213" stroke="var(--stroke-0, black)" x2="349" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents left-[3px] top-0">
      <Create />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute h-0 left-[4.74px] top-[59.57px] w-[388.256px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 388.256 0">
        <g id="Group 1410124807">
          <g id="Line 141"></g>
        </g>
      </svg>
    </div>
  );
}

function Frame17() {
  return <div className="h-[47px] shrink-0 w-[361px]" />;
}

function Group1() {
  return (
    <div className="absolute contents inset-[85.6%_3.32%_5.54%_3.32%]">
      <div className="absolute bg-[#fffefd] inset-[85.6%_3.32%_5.54%_3.32%] opacity-80 rounded-[20px]">
        <div aria-hidden="true" className="absolute border border-[#130326] border-solid inset-[-1px] pointer-events-none rounded-[21px]" />
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-[85.6%_3.32%_5.54%_3.32%]">
      <Group1 />
      <div className="absolute css-g0mm18 flex flex-col font-['Helvetica_Neue:Medium',sans-serif] inset-[86.68%_28.85%_6.81%_30.81%] justify-center leading-[0] not-italic text-[#130326] text-[18px] text-center tracking-[2px] uppercase">
        <p className="css-ew64yg leading-[22px] whitespace-nowrap">LISSY RODDY</p>
      </div>
    </div>
  );
}

function CardImage() {
  return (
    <div className="h-[347px] relative w-[347px]" data-name="Card/Image">
      {/* Circular image with smaller padding - 10px larger circle */}
      <div className="absolute inset-[12px] pointer-events-none rounded-full">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-full size-full" src={imgLissyRoddy} />
        <div className="absolute inset-0 rounded-full" style={{ border: '1px solid #EAEAEA' }} />
      </div>
      
      {/* Pill-shaped name badge at bottom - original design */}
      <div className="absolute inset-[85.6%_3.32%_5.54%_3.32%]">
        <div className="absolute bg-[#fffefd] inset-0 opacity-80 rounded-[20px]">
          <div aria-hidden="true" className="absolute border border-[#130326] border-solid inset-[-1px] pointer-events-none rounded-[21px]" />
        </div>
        <div className="absolute flex flex-col font-['Helvetica_Neue:Medium',sans-serif] inset-0 justify-center items-center leading-[22px] not-italic text-[#130326] text-[18px] text-center tracking-[2px] uppercase">
          <p className="css-ew64yg leading-[22px] whitespace-nowrap">LISSY RODDY</p>
        </div>
      </div>
    </div>
  );
}

function Component() {
  return (
    <div className="flex items-center justify-center h-[347px] w-[347px] relative shrink-0 rounded-[1px]" data-name="." style={{ border: '1px solid #1e1709' }}>
      <CardImage />
    </div>
  );
}

function Component1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name=".">
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none" />
      <Component />
    </div>
  );
}

function Frame20() {
  return <div className="h-px opacity-50 shrink-0 w-[361px]" />;
}

function Frame22() {
  return <div className="h-px opacity-50 w-[361px]" />;
}

function Frame23() {
  return <div className="h-0 opacity-50 shrink-0 w-[361px]" />;
}

function Component2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[14px] h-[400.756px] items-center left-[3px] px-[16px] rounded-[8px] top-[49.3px] w-[390px]" data-name=".">
      <Frame17 />
      <Component1 />
      <Frame20 />
      <p className="css-4hzbpn font-['Helvetica_Neue:Regular',sans-serif] leading-[30px] not-italic relative shrink-0 text-[15px] text-black text-center tracking-[1px] uppercase w-[361px] opacity-70">SLEEK DIRECTIONAL EDITS WITH EFFORTLESS PRECISION.</p>
      <Frame23 />
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents left-[3px] top-[49.3px]">
      <Group3 />
      <Component2 />
    </div>
  );
}

function CardLookbookBig() {
  return (
    <div className="col-1 h-[386.111px] ml-0 mt-0 relative row-1 w-[299px]" data-name="Card/Lookbook/Big">
      <div className="absolute border border-[#1e1709] border-solid inset-[4px] opacity-80 rounded-[8px]" data-name="Layer 1" />
      <div className="absolute border border-[#1e1709] border-solid inset-[8px_0_0_8px] rounded-[8px]" data-name="Layer 2" />
      <div className="absolute inset-[0_8px_8px_0] overflow-hidden rounded-[8px]" data-name="Main Image">
        <img alt="" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" src={img021} />
        <div aria-hidden="true" className="absolute border border-[#1e1709] border-solid inset-0 rounded-[8px]" />
      </div>
    </div>
  );
}

function Group4() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <CardLookbookBig />
    </div>
  );
}

function ButtonDark({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="content-stretch flex flex-col gap-[10px] items-center justify-center relative shrink-0 cursor-pointer" data-name="Button/Dark">
      <div className="h-[52px] relative shrink-0 w-[361px] pointer-events-none">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(30, 23, 9, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 361 52">
            <path d={svgPaths.p119e9000} data-figma-bg-blur-radius="4" fill="var(--fill-0, #1E1709)" id="Rectangle 2" />
            <defs>
              <clipPath id="bgblur_0_161_266_clip_path" transform="translate(4 4)">
                <path d={svgPaths.p119e9000} />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
      <div className="absolute flex items-center justify-center left-0 right-0 top-[26px] translate-y-[-50%] pointer-events-none">
        <p className="font-['Helvetica_Neue:Light',sans-serif] text-[16px] tracking-[0.08em] text-[#fffefd] uppercase leading-[18px]">GET STYLED</p>
      </div>
    </button>
  );
}

function Component3({ onButtonClick }: { onButtonClick: () => void }) {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-0 px-[16px] rounded-[8px] top-[582.67px]" data-name=".">
      <Group4 />
      {[...Array(2).keys()].map((_, i) => (
        <Frame20 key={i} />
      ))}
      <div className="flex flex-col gap-[6px] items-center mt-[20px]">
        <p className="css-4hzbpn leading-[normal] not-italic relative shrink-0 text-[#1e1709] text-[16px] text-center tracking-[0.1em] uppercase w-[361px]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif', fontWeight: 400 }}>1:1 styling</p>
        <p className="css-4hzbpn leading-[normal] not-italic relative shrink-0 text-[#1e1709] text-[14px] text-center tracking-[0.1em] w-[361px]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif', fontWeight: 400 }}>Upload a reference look to get started.</p>
      </div>
      <div className="flex items-center justify-center relative shrink-0 mt-[15px]">
        <div className="flex-none scale-y-[-100%]">
          <Frame22 />
        </div>
      </div>
      <ButtonDark onClick={onButtonClick} />
    </div>
  );
}

export function LissyLanding({ onImageUpload }: LissyLandingProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      sessionStorage.setItem('lissy_uploaded_image', dataUrl);
      sessionStorage.setItem('lissy_uploaded_image_name', file.name);
      sessionStorage.setItem('lissy_uploaded_image_type', file.type);
      onImageUpload(file);
      console.log('🚦 NAVIGATING TO INTAKE NOW (file input)', { href: window.location.href });
      alert('NAV TO /lissy/intake');
      navigate('/lissy/intake', { state: { base64: dataUrl, name: file.name, type: file.type } });
    };
    reader.readAsDataURL(file);
  };

  const handlePickImage = async () => {
    if (!Capacitor.isNativePlatform()) {
      fileInputRef.current?.click();
      return;
    }
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
      });
      if (image.base64String) {
        const mimeType = `image/${image.format || 'jpeg'}`;
        const fileName = `lissy-${Date.now()}.${image.format || 'jpeg'}`;
        const dataUrl = `data:${mimeType};base64,${image.base64String}`;
        // Also keep sessionStorage as backup
        sessionStorage.setItem('lissy_uploaded_image', dataUrl);
        sessionStorage.setItem('lissy_uploaded_image_name', fileName);
        sessionStorage.setItem('lissy_uploaded_image_type', mimeType);
        // Build File synchronously via atob
        const byteString = atob(image.base64String);
        const bytes = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
        const blob = new Blob([bytes], { type: mimeType });
        const file = new File([blob], fileName, { type: mimeType });
        setSelectedImage(file);
        onImageUpload(file);
        // Pass image data through router state — synchronous, no timing issues
        console.log('🚦 NAVIGATING TO INTAKE NOW (camera)', { href: window.location.href });
        alert('NAV TO /lissy/intake');
        navigate('/lissy/intake', { state: { base64: dataUrl, name: fileName, type: mimeType } });
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleHomeClick = () => {
    console.log('Home button clicked, navigating to /');
    navigate('/');
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Lissy Roddy - SEVN SELECTS',
      text: 'Sleek directional edits with effortless precision.',
      url: window.location.href,
    };

    try {
      // Check if Web Share API is available
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        console.log('✅ Shared successfully');
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
        console.log('✅ URL copied to clipboard');
      }
    } catch (err: any) {
      // Only log errors that aren't user cancellations
      if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
        console.error('❌ Error sharing:', err);
      }
      
      // Fallback to clipboard on any error (except user cancellation)
      if (err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert('Link copied to clipboard!');
          console.log('✅ URL copied to clipboard as fallback');
        } catch (clipboardErr) {
          console.error('❌ Failed to copy to clipboard:', clipboardErr);
        }
      }
    }
  };


  return (
    <div 
      className="relative w-full h-dvh overflow-x-hidden bg-white"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Top Navigation Bar - matches HomePage */}
      <div className="bg-white h-[48px] w-full relative z-50">
        <div className="h-full flex items-center justify-between px-4 max-w-[393px] mx-auto">
          {/* Back button aligned left */}
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-1 text-black hover:opacity-70 transition-opacity"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* SEVN SELECTS title centered */}
          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[20px] tracking-[3px] text-black uppercase absolute left-1/2 transform -translate-x-1/2">
            SEVN SELECTS
          </p>
          
          {/* Share button on right */}
          <button className="hover:opacity-70 transition-opacity" onClick={handleShare}>
            <div className="bg-[rgba(255,254,253,0.8)] border border-[#1e1709] rounded-[20px] size-[32px] flex items-center justify-center"><svg className="w-[12px] h-[12px]" fill="none" viewBox="0 0 13 12.55"><path d="M12.5 8.55V12.05H0.5V8.55" stroke="black" /><path d="M6.5 0.5V8.5M6.5 0.5L3.5 3.5M6.5 0.5L9.5 3.5" stroke="#1E1709" strokeLinecap="square" strokeLinejoin="round" strokeWidth="1.1" /></svg></div>
          </button>
        </div>
      </div>

      {/* Scrollable content with proper spacing from top nav */}
      <div className="w-full max-w-[393px] mx-auto overflow-y-auto pb-24 pt-4">
        <div className="relative w-[390px] mx-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {/* Lissy's profile card section */}
          <div className="relative px-4">
            <Component />
            <div className="h-4" /> {/* spacer */}
            <p className="css-4hzbpn font-['Helvetica_Neue:Regular',sans-serif] leading-[30px] not-italic text-[15px] text-black text-center tracking-[1px] uppercase opacity-70">
              SLEEK DIRECTIONAL EDITS WITH EFFORTLESS PRECISION.
            </p>
            {/* Divider line */}
            <div className="w-full h-px bg-black opacity-50 mt-4" />
          </div>
          
          {/* Lookbook section */}
          <div className="relative px-4 mt-8">
            <div className="flex justify-center">
              <Group4 />
            </div>
            <div className="flex flex-col gap-[6px] items-center mt-[20px]">
              <p className="css-4hzbpn leading-[normal] not-italic relative shrink-0 text-[#1e1709] text-[16px] text-center tracking-[0.1em] uppercase w-[361px]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif', fontWeight: 400 }}>1:1 styling</p>
              <p className="css-4hzbpn leading-[normal] not-italic relative shrink-0 text-[#1e1709] text-[14px] text-center tracking-[0.1em] w-[361px]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif', fontWeight: 400 }}>Upload a reference look to get started.</p>
            </div>
            <div className="mt-6">
              <ButtonDark onClick={handlePickImage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}