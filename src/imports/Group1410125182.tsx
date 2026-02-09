import svgPaths from "./svg-rfh936opav";
import imgScreenshot20231117At12528 from "figma:asset/4b4531903296dd337e2503bb17f59748fdc6c9ee.png";
import imgScreenshot20231117At12529 from "figma:asset/7ba87817f8223271b091058d7d6c574cf1ba0452.png";
import img021 from "figma:asset/1f70f8addd2ecb3091c805e461a74ebf7efafd81.png";

function Group3() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute bg-[rgba(255,254,253,0.8)] h-[706px] left-0 top-0 w-[390px]" />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute h-0 left-[6.66px] top-[70.66px] w-[383.341px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 383.341 0">
        <g id="Group 1410124807">
          <g id="Line 141" />
        </g>
      </svg>
    </div>
  );
}

function CardLookbookBig() {
  return (
    <div className="col-1 h-[403.749px] ml-[0.5px] mt-[26.25px] relative row-1 w-[299px]" data-name="Card/Lookbook/Big">
      <div className="absolute border border-[#1e1709] border-solid inset-[2.22%] opacity-80 rounded-[8px]" data-name="Screenshot 2023-11-17 at 12.52 6" />
      <div className="absolute border border-[#1e1709] border-solid inset-[4.43%_0_0_4.43%] rounded-[8px]" data-name="Screenshot 2023-11-17 at 12.52 7" />
      <div className="absolute inset-[0_4.43%_4.43%_0] pointer-events-none rounded-[8px]" data-name="Screenshot 2023-11-17 at 12.52 8">
        <div aria-hidden="true" className="absolute inset-0 rounded-[8px]">
          <img alt="" className="absolute max-w-none object-cover rounded-[8px] size-full" src={imgScreenshot20231117At12528} />
          <div className="absolute inset-0 overflow-hidden rounded-[8px]">
            <img alt="" className="absolute h-[120.16%] left-[-2.54%] max-w-none top-[-4.17%] w-[111.88%]" src={imgScreenshot20231117At12529} />
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-[#1e1709] border-solid inset-0 rounded-[8px]" />
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <CardLookbookBig />
      <div className="col-1 h-[410.952px] ml-0 mt-0 pointer-events-none relative rounded-[8px] row-1 w-[286px]" data-name="0_2 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[8px] size-full" src={img021} />
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 rounded-[8px]" />
      </div>
    </div>
  );
}

function Frame() {
  return <div className="h-[5px] opacity-50 shrink-0 w-[361px]" />;
}

function Frame1() {
  return <div className="h-[5px] opacity-50 shrink-0 w-[361px]" />;
}

function ButtonDark() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-center justify-center relative shrink-0" data-name="Button/Dark">
      <div className="h-[52px] relative shrink-0 w-[361px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 361 52">
          <path d={svgPaths.p119e9000} data-figma-bg-blur-radius="4" fill="var(--fill-0, #1E1709)" id="Rectangle 2" />
          <defs>
            <clipPath id="bgblur_0_518_873_clip_path" transform="translate(4 4)">
              <path d={svgPaths.p119e9000} />
            </clipPath>
          </defs>
        </svg>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Helvetica_Neue:Bold',sans-serif] justify-center leading-[0] left-[calc(50%-0.5px)] not-italic text-[#fffefd] text-[16px] text-center top-[26px] whitespace-nowrap">
        <p className="leading-[18px]">UPLOAD</p>
      </div>
    </div>
  );
}

function Component() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[14px] h-[644.329px] items-center left-0 px-[16px] rounded-[8px] top-[61.67px] w-[390px]" data-name=".">
      <Group1 />
      <Frame />
      <p className="font-['Helvetica_Neue:Medium',sans-serif] leading-[18px] not-italic relative shrink-0 text-[#1e1709] text-[20px] text-center w-[273px] whitespace-pre-wrap">STYLE → SELL</p>
      <p className="font-['Helvetica_Neue:Regular',sans-serif] leading-[26px] not-italic relative shrink-0 text-[#1e1709] text-[16px] text-center tracking-[1px] uppercase w-[361px] whitespace-pre-wrap">POST YOU EDIT. LINK DEPOP OR SHOP.</p>
      <Frame1 />
      <ButtonDark />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-0 top-[61.67px]">
      <Group />
      <Component />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents left-0 top-0">
      <Group3 />
      <Group2 />
    </div>
  );
}

export default function Group5() {
  return (
    <div className="relative size-full">
      <Group4 />
    </div>
  );
}