import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import svgPaths from "../imports/svg-ixy1f48tju";
import imgChrisProfile from "figma:asset/083df4dc1c94d586d53c3644182d81e287c70454.png";
import imgChrisEdit from "figma:asset/d6d0374d1209d254e69a363bf2bd48de2a8fd831.png";
import imgScreenshot20231117At12528 from "figma:asset/4b4531903296dd337e2503bb17f59748fdc6c9ee.png";
import imgScreenshot20231117At12529 from "figma:asset/7ba87817f8223271b091058d7d6c574cf1ba0452.png";
import img021 from "figma:asset/e848b14a74d352089a614d152282f09191ed8fc0.png";
import imgShareIcon from "figma:asset/acdcb062503544d45e9ec42f141e5eaf2bc04359.png";

interface ChrisLandingProps {
  onImageUpload: (file: File) => void;
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
        <p className="css-ew64yg leading-[22px] whitespace-nowrap">CHRIS WHLY</p>
      </div>
    </div>
  );
}

function CardImage() {
  return (
    <div className="h-[338px] relative rounded-[360px] shrink-0 w-[347px]" data-name="Card/Image">
      <div className="absolute inset-0 rounded-[360px]" data-name="Chris Profile">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[360px]">
          <img alt="" className="absolute max-w-none object-cover rounded-[360px] size-full" src={imgChrisProfile} />
          <img alt="" className="absolute max-w-none object-cover rounded-[360px] size-full" src={imgChrisProfile} />
        </div>
      </div>
      <Group2 />
    </div>
  );
}

function Component() {
  return (
    <div className="content-stretch flex flex-col h-[338px] items-start relative shrink-0" data-name=".">
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none" />
      <CardImage />
    </div>
  );
}

function CardLookbookBig() {
  return (
    <div className="col-1 h-[386.111px] ml-0 mt-0 relative row-1 w-[299px]" data-name="Card/Lookbook/Big">
      <div className="absolute border border-[#1e1709] border-solid inset-[4px] opacity-80 rounded-[8px]" data-name="Layer 1" />
      <div className="absolute border border-[#1e1709] border-solid inset-[8px_0_0_8px] rounded-[8px]" data-name="Layer 2" />
      <div className="absolute inset-[0_8px_8px_0] pointer-events-none rounded-[8px]" data-name="Main Image">
        <div aria-hidden="true" className="absolute inset-0 rounded-[8px]">
          <img alt="" className="absolute max-w-none object-cover rounded-[8px] size-full" src={imgChrisEdit} />
        </div>
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
    <button onClick={onClick} className="w-full content-stretch flex flex-col gap-[10px] items-center justify-center relative shrink-0 cursor-pointer" data-name="Button/Dark">
      <div className="h-[52px] relative shrink-0 w-full pointer-events-none">
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

export function ChrisLanding({ onImageUpload }: ChrisLandingProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    navigate('/chris/intake', { state: { imageUrl: URL.createObjectURL(file) } });
  };

  const handlePickImage = async () => {
    if (!Capacitor.isNativePlatform()) {
      fileInputRef.current?.click();
      return;
    }
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });
      if (image.webPath) {
        navigate('/chris/intake', { state: { imageUrl: image.webPath } });
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
      title: 'Chris Whly - SEVN SELECTS',
      text: 'Bold avant-garde styling with fearless edge.',
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
          
          {/* Chris's profile card section */}
          <div className="relative px-4">
            <Component />
            <div className="h-4" /> {/* spacer */}
            <p className="css-4hzbpn font-['Helvetica_Neue:Regular',sans-serif] leading-[30px] not-italic text-[15px] text-black text-center tracking-[1px] uppercase opacity-70">
              BOLD AVANT-GARDE STYLING WITH FEARLESS EDGE.
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
              <p className="css-4hzbpn leading-[normal] not-italic text-[#1e1709] text-[16px] text-center tracking-[0.1em] uppercase w-[361px]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif', fontWeight: 400 }}>
                1:1 styling
              </p>
              <p className="css-4hzbpn leading-[normal] not-italic text-[#1e1709] text-[14px] text-center tracking-[0.1em] w-[361px]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif', fontWeight: 400 }}>
                Upload a reference look to get started.
              </p>
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