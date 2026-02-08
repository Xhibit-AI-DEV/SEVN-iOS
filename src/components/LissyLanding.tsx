import { useState } from 'react';
import { useNavigate } from 'react-router';
import svgPaths from "../imports/svg-ixy1f48tju";
import imgScreenshot20231117At12524 from "figma:asset/557e4ca658e2ff37cf2dda18e4534c106ec861c0.png";
import imgScreenshot20231117At12525 from "figma:asset/e4b87ad125820c87df00cd6e705bde4e8af3e67e.png";
import imgScreenshot20231117At12528 from "figma:asset/4b4531903296dd337e2503bb17f59748fdc6c9ee.png";
import imgScreenshot20231117At12529 from "figma:asset/7ba87817f8223271b091058d7d6c574cf1ba0452.png";
import img021 from "figma:asset/e848b14a74d352089a614d152282f09191ed8fc0.png";
import imgShareIcon from "figma:asset/acdcb062503544d45e9ec42f141e5eaf2bc04359.png";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

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
    <div className="h-[338px] relative rounded-[360px] shrink-0 w-[347px]" data-name="Card/Image">
      <div className="absolute inset-0 rounded-[360px]" data-name="Screenshot 2023-11-17 at 12.52 4">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[360px]">
          <img alt="" className="absolute max-w-none object-cover rounded-[360px] size-full" src={imgScreenshot20231117At12524} />
          <img alt="" className="absolute max-w-none object-cover rounded-[360px] size-full" src={imgScreenshot20231117At12524} />
          <img alt="" className="absolute max-w-none object-cover rounded-[360px] size-full" src={imgScreenshot20231117At12525} />
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
        <p className="css-4hzbpn leading-[normal] not-italic relative shrink-0 text-[#1e1709] text-[12px] text-center tracking-[0.1em] uppercase w-[361px]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif', fontWeight: 700 }}>1:1 styling</p>
        <p className="css-4hzbpn font-['Helvetica_Neue:Light',sans-serif] leading-[25px] not-italic relative shrink-0 text-[#1e1709] text-[14px] text-center tracking-[1px] uppercase w-[333px]">Upload a reference look</p>
      </div>
      <div className="flex items-center justify-center relative shrink-0 mt-[15px]">
        <div className="flex-none scale-y-[-100%]">
          <Frame22 />
        </div>
      </div>
      <Frame23 />
      <ButtonDark onClick={onButtonClick} />
    </div>
  );
}

export function LissyLanding({ onImageUpload }: LissyLandingProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📸 [LissyLanding] handleFileChange called');
    const file = e.target.files?.[0];
    console.log('📸 [LissyLanding] Selected file:', file);
    if (file) {
      console.log('📸 [LissyLanding] File details:', file.name, file.type, file.size);
      setSelectedImage(file);
      console.log('📸 [LissyLanding] Calling onImageUpload...');
      onImageUpload(file);
    } else {
      console.warn('⚠️ [LissyLanding] No file selected');
    }
  };

  const triggerFileInput = () => {
    console.log('🖱️ [LissyLanding] Button clicked! Triggering file input...');
    const input = document.getElementById('image-upload');
    console.log('🖱️ [LissyLanding] Input element:', input);
    input?.click();
  };

  const handleHomeClick = () => {
    console.log('Home button clicked, navigating to /');
    console.log('Current location:', window.location.href);
    console.log('Current hash:', window.location.hash);
    
    // Try both methods
    navigate('/');
    
    // Also try direct hash manipulation as backup
    setTimeout(() => {
      window.location.hash = '/';
    }, 100);
  };

  const takePhoto = async () => {
    if (Capacitor.isNativePlatform()) {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });
      const response = await fetch(image.webPath!);
      const blob = await response.blob();
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      handleFileChange({ target: { files: [file] } } as React.ChangeEvent<HTMLInputElement>);
    } else {
      triggerFileInput();
    }
  };

  return (
    <div 
      className="relative w-full min-h-screen overflow-x-hidden bg-white"
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
          <button className="hover:opacity-70 transition-opacity">
            <img alt="Share" className="w-[32px] h-[32px]" src={imgShareIcon} />
          </button>
        </div>
      </div>

      {/* Scrollable content with proper spacing from top nav */}
      <div className="w-full max-w-[393px] mx-auto overflow-y-auto pb-24 pt-4">
        <div className="relative w-[390px] mx-auto">
          <input
            id="image-upload"
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
              <p className="css-4hzbpn leading-[normal] not-italic text-[#1e1709] text-[12px] text-center tracking-[0.1em] uppercase w-[361px]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif', fontWeight: 700 }}>
                1:1 styling
              </p>
              <p className="css-4hzbpn font-['Helvetica_Neue:Light',sans-serif] leading-[25px] not-italic text-[#1e1709] text-[14px] text-center tracking-[1px] uppercase w-[333px]">
                Upload a reference look
              </p>
            </div>
            <div className="mt-4">
              <ButtonDark onClick={takePhoto} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}