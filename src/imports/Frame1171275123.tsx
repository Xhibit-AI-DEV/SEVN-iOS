import svgPaths from "./svg-y95p2pf80u";

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0">
      <div className="h-[36px] relative shrink-0 w-[177px]">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(30, 23, 9, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 177 36">
            <path d={svgPaths.p1bfb8d00} data-figma-bg-blur-radius="4" fill="var(--fill-0, #1E1709)" id="Rectangle 2" />
            <defs>
              <clipPath id="bgblur_0_252_1677_clip_path" transform="translate(4 4)">
                <path d={svgPaths.p1bfb8d00} />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute css-g0mm18 flex flex-col font-['Helvetica_Neue:Bold',sans-serif] justify-center leading-[0] left-[calc(50%-0.5px)] not-italic text-[14px] text-center text-white top-[18px]">
        <p className="css-ew64yg leading-[18px]">FOLLOW</p>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0">
      <div className="h-[36px] relative shrink-0 w-[176px]">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(30, 23, 9, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 176 36">
            <path d={svgPaths.p1a75c400} data-figma-bg-blur-radius="4" fill="var(--fill-0, #1E1709)" id="Rectangle 27" />
            <defs>
              <clipPath id="bgblur_0_252_1673_clip_path" transform="translate(4 4)">
                <path d={svgPaths.p1a75c400} />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute css-g0mm18 flex flex-col font-['Helvetica_Neue:Bold',sans-serif] justify-center leading-[0] left-[calc(50%-0.5px)] not-italic text-[14px] text-center text-white top-[18px]">
        <p className="css-ew64yg leading-[18px]">SHARE</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0">
      <Frame1 />
      <Frame />
    </div>
  );
}

export default function Frame3() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full">
      <Frame2 />
    </div>
  );
}