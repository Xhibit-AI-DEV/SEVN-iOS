import svgPaths from "./svg-ufgvocos3u";
import imgScreenshot20231117At12524 from "figma:asset/e4b87ad125820c87df00cd6e705bde4e8af3e67e.png";
import imgScreenshot20231117At12528 from "figma:asset/4b4531903296dd337e2503bb17f59748fdc6c9ee.png";
import imgScreenshot20231117At12529 from "figma:asset/7ba87817f8223271b091058d7d6c574cf1ba0452.png";
import img021 from "figma:asset/e848b14a74d352089a614d152282f09191ed8fc0.png";
import img22 from "figma:asset/9f1f3c2c66a18611ca3dc256be40c92f256300b5.png";
import img23 from "figma:asset/dc4a94b037394f66bed6a12794407362ed8ee90b.png";
import imgScreenshot20251206At1814361 from "figma:asset/41c188ecfcaa3db83d93c8c78adf6686dbdf5b5d.png";
import img24 from "figma:asset/018d91ae7d1519157480541eba566ed2d99456a2.png";

function RightSide() {
  return (
    <div className="absolute h-[9.931px] left-[calc(83.33%+17.41px)] top-[12px] translate-x-[-50%] w-[57.825px]" data-name="Right Side">
      <div className="absolute inset-[0_0_-0.01%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 57.8244 9.93216">
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

function Group2() {
  return (
    <div className="absolute contents inset-[85.6%_3.32%_5.54%_3.32%]">
      <div className="absolute bg-[#fffefd] inset-[85.6%_3.32%_5.54%_3.32%] opacity-80 rounded-[20px]">
        <div aria-hidden="true" className="absolute border border-[#130326] border-solid inset-[-1px] pointer-events-none rounded-[21px]" />
      </div>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents inset-[82.66%_3.32%_3.76%_3.32%]">
      <Group2 />
      <div className="absolute css-g0mm18 flex flex-col font-['Helvetica_Neue:Medium',sans-serif] inset-[82.66%_21.94%_3.76%_23.71%] justify-center leading-[0] not-italic text-[#130326] text-[12px] text-center tracking-[2px] uppercase">
        <p className="css-ew64yg leading-[22px]">LISSY Roddy</p>
      </div>
    </div>
  );
}

function CardImage() {
  return (
    <div className="absolute h-[162px] left-[128px] rounded-[360px] top-[725px] w-[184px]" data-name="Card/Image">
      <div className="absolute inset-0 rounded-[360px]" data-name="Screenshot 2023-11-17 at 12.52 4">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[360px] size-full" src={imgScreenshot20231117At12524} />
      </div>
      <Group4 />
    </div>
  );
}

function Create() {
  return (
    <div className="absolute bg-white h-[2154px] left-0 overflow-clip top-0 w-[439px]" data-name="Create">
      {[...Array(2).keys()].map((_, i) => (
        <StatusBarIPhone1313Pro key={i} />
      ))}
      <CardImage />
      <p className="absolute css-4hzbpn font-['Helvetica_Neue:Regular',sans-serif] leading-[normal] left-[219.5px] not-italic text-[#1e1709] text-[18px] text-center top-[915px] tracking-[2px] translate-x-[-50%] uppercase w-[361px]">STYLING NOTES</p>
      <div className="absolute font-['Helvetica_Neue:Regular',sans-serif] h-[420px] leading-[24px] left-[calc(50%-180.5px)] not-italic text-[#1e1709] text-[14px] top-[964px] tracking-[1px] uppercase w-[361px]">
        <p className="css-4hzbpn mb-0">You already have a natural ease in your style. What we’re doing now is simply refining it, giving your look that quiet, modern polish.</p>
        <p className="css-4hzbpn mb-0">&nbsp;</p>
        <p className="css-4hzbpn mb-0">Focus on a few elevated accessories: a structured bag, a clean belt, shoes with intention. Keep a neutral base and add one or two tones that highlight your features in your case blue hues. It creates cohesion and gives your wardrobe a signature feel.</p>
        <p className="css-4hzbpn mb-0">&nbsp;</p>
        <p className="css-4hzbpn">Everything selected for you is meant to express your style at its most refined: modern, effortless, and unmistakably you.</p>
      </div>
      <div className="absolute h-0 left-[45px] top-[1419px] w-[349px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 349 1">
            <line id="Line 216" stroke="var(--stroke-0, black)" x2="349" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Group10() {
  return (
    <div className="absolute contents left-0 top-0">
      <Create />
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute h-0 left-[1.96px] top-[62.56px] w-[436.665px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 436.665 0">
        <g id="Group 1410124807">
          <g id="Line 141"></g>
        </g>
      </svg>
    </div>
  );
}

function Group11() {
  return (
    <div className="absolute contents left-[1.96px] top-[62.56px]">
      <Group6 />
    </div>
  );
}

function CardLookbookBig() {
  return (
    <div className="col-1 h-[386.111px] ml-0 mt-0 relative row-1 w-[299px]" data-name="Card/Lookbook/Big">
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

function Group8() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <CardLookbookBig />
      <div className="col-1 h-[368.153px] ml-0 mt-0 pointer-events-none relative rounded-[8px] row-1 w-[286px]" data-name="0_2 1">
        <div aria-hidden="true" className="absolute inset-0 rounded-[8px]">
          <img alt="" className="absolute max-w-none object-cover rounded-[8px] size-full" src={img021} />
          <img alt="" className="absolute max-w-none object-cover rounded-[8px] size-full" src={img22} />
          <img alt="" className="absolute max-w-none object-cover rounded-[8px] size-full" src={img021} />
          <img alt="" className="absolute max-w-none object-cover rounded-[8px] size-full" src={img23} />
        </div>
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 rounded-[8px]" />
      </div>
    </div>
  );
}

function Frame() {
  return <div className="h-px opacity-50 shrink-0 w-[361px]" />;
}

function Frame2() {
  return <div className="h-[10px] opacity-50 shrink-0 w-[361px]" />;
}

function Frame3() {
  return <div className="h-[5px] opacity-50 shrink-0 w-[361px]" />;
}

function Component() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[14px] h-[490px] items-center left-0 px-[16px] rounded-[8px] top-[148px] w-[442px]" data-name=".">
      <Group8 />
      <Frame />
      <p className="css-4hzbpn font-['Helvetica_Neue:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e1709] text-[18px] text-center tracking-[2px] uppercase w-[361px]">YOUR SEVN SELECTS</p>
      <Frame />
      <p className="css-4hzbpn font-['Helvetica_Neue:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#1e1709] text-[14px] text-center tracking-[1px] uppercase w-[361px]">{`Handpicked Edit + styling tips `}</p>
      <Frame2 />
      <div className="h-0 relative shrink-0 w-[349px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 349 1">
            <line id="Line 215" stroke="var(--stroke-0, black)" x2="349" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Frame3 />
    </div>
  );
}

function Group14() {
  return (
    <div className="absolute contents left-0 top-0">
      <Group10 />
      <Group11 />
      <p className="absolute css-4hzbpn font-['Helvetica_Neue:Regular',sans-serif] h-[22.376px] leading-[22px] left-[219.31px] not-italic text-[24px] text-black text-center top-[72.21px] tracking-[3px] translate-x-[-50%] uppercase w-[438.626px]">SEVN SELECTS</p>
      <div className="absolute h-[227px] left-[62px] pointer-events-none rounded-[3px] top-[1490px] w-[126px]" data-name="Screenshot 2025-12-06 at 18.14.36 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[3px] size-full" src={imgScreenshot20251206At1814361} />
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 rounded-[3px]" />
      </div>
      <div className="absolute h-[227px] left-[246px] pointer-events-none rounded-[3px] top-[1490px] w-[126px]" data-name="Screenshot 2025-12-06 at 18.14.36 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[3px] size-full" src={imgScreenshot20251206At1814361} />
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 rounded-[3px]" />
      </div>
      <div className="absolute h-[227px] left-[62px] pointer-events-none rounded-[3px] top-[1764px] w-[126px]" data-name="Screenshot 2025-12-06 at 18.14.36 3">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[3px] size-full" src={imgScreenshot20251206At1814361} />
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 rounded-[3px]" />
      </div>
      <div className="absolute h-[227px] left-[246px] pointer-events-none rounded-[3px] top-[1764px] w-[126px]" data-name="Screenshot 2025-12-06 at 18.14.36 4">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[3px] size-full" src={imgScreenshot20251206At1814361} />
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 rounded-[3px]" />
      </div>
      <Component />
    </div>
  );
}

function RightSide1() {
  return (
    <div className="absolute h-[9.931px] left-[calc(83.33%+17.41px)] top-[12px] translate-x-[-50%] w-[57.825px]" data-name="Right Side">
      <div className="absolute inset-[0_0_-0.01%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 57.8244 9.93216">
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
    </div>
  );
}

function LeftSide1() {
  return (
    <div className="absolute contents left-[16px] top-1/2 translate-y-[-50%]" data-name="Left Side">
      <p className="absolute css-ew64yg font-['Oswald:Medium',sans-serif] font-medium leading-[17.522px] left-[26.5px] text-[13.142px] text-black text-center top-[calc(50%-9px)] tracking-[-0.4381px] translate-x-[-50%]">9:41</p>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[16px] top-[8px]">
      <RightSide1 />
      <LeftSide1 />
    </div>
  );
}

function StatusBarIPhone1313Pro1() {
  return (
    <div className="absolute h-[34px] left-0 overflow-clip top-0 w-[375px]" data-name="StatusBar / iPhone 13 & 13 Pro">
      <Group1 />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents inset-[85.6%_3.32%_5.54%_3.32%]">
      <div className="absolute bg-[#fffefd] inset-[85.6%_3.32%_5.54%_3.32%] opacity-80 rounded-[20px]">
        <div aria-hidden="true" className="absolute border border-[#130326] border-solid inset-[-1px] pointer-events-none rounded-[21px]" />
      </div>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents inset-[82.66%_3.32%_3.76%_3.32%]">
      <Group3 />
      <div className="absolute css-g0mm18 flex flex-col font-['Helvetica_Neue:Medium',sans-serif] inset-[82.66%_21.94%_3.76%_23.71%] justify-center leading-[0] not-italic text-[#130326] text-[12px] text-center tracking-[2px] uppercase">
        <p className="css-ew64yg leading-[22px]">LISSY Roddy</p>
      </div>
    </div>
  );
}

function CardImage1() {
  return (
    <div className="absolute h-[162px] left-[128px] rounded-[360px] top-[760px] w-[184px]" data-name="Card/Image">
      <div className="absolute inset-0 rounded-[360px]" data-name="Screenshot 2023-11-17 at 12.52 4">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[360px] size-full" src={imgScreenshot20231117At12524} />
      </div>
      <Group5 />
    </div>
  );
}

function ButtonDark() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[10px] items-center justify-center left-[39px] top-[3046px] w-[361px]" data-name="Button/Dark">
      <div className="h-[52px] relative shrink-0 w-full">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(30, 23, 9, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 361 52">
            <path d={svgPaths.p119e9000} data-figma-bg-blur-radius="4" fill="var(--fill-0, #1E1709)" id="Rectangle 2" />
            <defs>
              <clipPath id="bgblur_0_272_1554_clip_path" transform="translate(4 4)">
                <path d={svgPaths.p119e9000} />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
      <div className="absolute css-g0mm18 flex flex-col font-['IBM_Plex_Mono:Regular',sans-serif] justify-center leading-[0] left-1/2 not-italic text-[#fffefd] text-[14px] text-center top-[26px] translate-x-[-50%] translate-y-[-50%]">
        <p className="css-ew64yg leading-[normal]">GET ANOTHER EDIT</p>
      </div>
    </div>
  );
}

function Create1() {
  return (
    <div className="absolute bg-white h-[3146px] left-0 overflow-clip top-0 w-[439px]" data-name="Create">
      {[...Array(2).keys()].map((_, i) => (
        <StatusBarIPhone1313Pro1 key={i} />
      ))}
      <CardImage1 />
      <p className="absolute css-4hzbpn font-['Helvetica_Neue:Regular',sans-serif] leading-[normal] left-[219.5px] not-italic text-[#1e1709] text-[18px] text-center top-[950px] tracking-[2px] translate-x-[-50%] uppercase w-[361px]">STYLING NOTES</p>
      <p className="absolute css-4hzbpn font-['Helvetica_Neue:Regular',sans-serif] leading-[normal] left-[219.5px] not-italic text-[#1e1709] text-[18px] text-center top-[1442px] tracking-[2px] translate-x-[-50%] uppercase w-[361px]">SEVN SELECTS</p>
      <div className="absolute font-['Helvetica_Neue:Regular',sans-serif] h-[311px] leading-[24px] left-[calc(50%-180.5px)] not-italic text-[#1e1709] text-[14px] top-[999px] tracking-[1px] uppercase w-[361px]">
        <p className="css-4hzbpn mb-0">You already have a natural ease in your style. What we’re doing now is simply refining it, giving your look that quiet, modern polish.</p>
        <p className="css-4hzbpn mb-0">&nbsp;</p>
        <p className="css-4hzbpn mb-0">Focus on a few elevated accessories: a structured bag, a clean belt, shoes with intention. Keep a neutral base and add one or two tones that highlight your features in your case blue hues. It creates cohesion and gives your wardrobe a signature feel.</p>
        <p className="css-4hzbpn mb-0">&nbsp;</p>
        <p className="css-4hzbpn">&nbsp;</p>
      </div>
      <div className="absolute h-0 left-[45px] top-[1365px] w-[349px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 349 1">
            <line id="Line 216" stroke="var(--stroke-0, black)" x2="349" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <div className="absolute h-0 left-[44px] top-[2996px] w-[349px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 349 1">
            <line id="Line 216" stroke="var(--stroke-0, black)" x2="349" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <ButtonDark />
      <div className="absolute h-[559px] left-[65px] pointer-events-none rounded-[5px] top-[1515px] w-[310px]" data-name="Screenshot 2025-12-06 at 18.14.36 7">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[5px] size-full" src={imgScreenshot20251206At1814361} />
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 rounded-[5px]" />
      </div>
    </div>
  );
}

function Group12() {
  return (
    <div className="absolute contents left-0 top-0">
      <Create1 />
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute h-0 left-[1.96px] top-[72.98px] w-[436.665px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 436.665 0">
        <g id="Group 1410124807">
          <g id="Line 141"></g>
        </g>
      </svg>
    </div>
  );
}

function Group13() {
  return (
    <div className="absolute contents left-[1.96px] top-[72.98px]">
      <Group7 />
    </div>
  );
}

function CardLookbookBig1() {
  return (
    <div className="col-1 h-[386.111px] ml-0 mt-0 relative row-1 w-[299px]" data-name="Card/Lookbook/Big">
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

function Group9() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <CardLookbookBig1 />
      <div className="col-1 h-[368.153px] ml-0 mt-0 pointer-events-none relative rounded-[8px] row-1 w-[286px]" data-name="0_2 1">
        <div aria-hidden="true" className="absolute inset-0 rounded-[8px]">
          <img alt="" className="absolute max-w-none object-cover rounded-[8px] size-full" src={img021} />
          <img alt="" className="absolute max-w-none object-cover rounded-[8px] size-full" src={img22} />
          <img alt="" className="absolute max-w-none object-cover rounded-[8px] size-full" src={img021} />
          <img alt="" className="absolute max-w-none object-cover rounded-[8px] size-full" src={img24} />
        </div>
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 rounded-[8px]" />
      </div>
    </div>
  );
}

function Frame1() {
  return <div className="h-px opacity-50 shrink-0 w-[361px]" />;
}

function Frame4() {
  return <div className="h-[10px] opacity-50 shrink-0 w-[361px]" />;
}

function Frame5() {
  return <div className="h-[5px] opacity-50 shrink-0 w-[361px]" />;
}

function Component1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[14px] h-[571.667px] items-center left-0 px-[16px] rounded-[8px] top-[172.67px] w-[442px]" data-name=".">
      <Group9 />
      <Frame1 />
      <p className="css-4hzbpn font-['Helvetica_Neue:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e1709] text-[18px] text-center tracking-[2px] uppercase w-[361px]">YOUR SEVN SELECTS</p>
      <Frame1 />
      <p className="css-4hzbpn font-['Helvetica_Neue:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#1e1709] text-[14px] text-center tracking-[1px] uppercase w-[361px]">{`Handpicked Edit + styling tips `}</p>
      <Frame4 />
      <div className="h-0 relative shrink-0 w-[349px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 349 1">
            <line id="Line 215" stroke="var(--stroke-0, black)" x2="349" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Frame5 />
    </div>
  );
}

function Group15() {
  return (
    <div className="absolute contents left-0 top-0">
      <Group12 />
      <Group13 />
      <p className="absolute css-4hzbpn font-['Helvetica_Neue:Regular',sans-serif] h-[26.105px] leading-[22px] left-[219.31px] not-italic text-[24px] text-black text-center top-[110.83px] tracking-[3px] translate-x-[-50%] uppercase w-[438.626px]">SEVN SELECTS</p>
      <div className="absolute h-[245.276px] left-[67.05px] pointer-events-none rounded-[5px] top-[2133px] w-[136.047px]" data-name="Screenshot 2025-12-06 at 18.14.36 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[5px] size-full" src={imgScreenshot20251206At1814361} />
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 rounded-[5px]" />
      </div>
      <div className="absolute h-[245.276px] left-[251.05px] pointer-events-none rounded-[5px] top-[2133px] w-[136.047px]" data-name="Screenshot 2025-12-06 at 18.14.36 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[5px] size-full" src={imgScreenshot20251206At1814361} />
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 rounded-[5px]" />
      </div>
      <div className="absolute h-[245.276px] left-[62px] pointer-events-none rounded-[5px] top-[2690.83px] w-[136.047px]" data-name="Screenshot 2025-12-06 at 18.14.36 3">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[5px] size-full" src={imgScreenshot20251206At1814361} />
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 rounded-[5px]" />
      </div>
      <div className="absolute h-[245.276px] left-[246px] pointer-events-none rounded-[5px] top-[2690.83px] w-[136.047px]" data-name="Screenshot 2025-12-06 at 18.14.36 4">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[5px] size-full" src={imgScreenshot20251206At1814361} />
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 rounded-[5px]" />
      </div>
      <Component1 />
    </div>
  );
}

function Group16() {
  return (
    <div className="absolute contents left-0 top-0">
      <Group14 />
      <Group15 />
      <div className="absolute h-[227px] left-[72.09px] pointer-events-none rounded-[5px] top-[2410.84px] w-[126px]" data-name="Screenshot 2025-12-06 at 18.14.36 5">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[5px] size-full" src={imgScreenshot20251206At1814361} />
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 rounded-[5px]" />
      </div>
      <div className="absolute h-[227px] left-[256.09px] pointer-events-none rounded-[5px] top-[2410.84px] w-[126px]" data-name="Screenshot 2025-12-06 at 18.14.36 6">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[5px] size-full" src={imgScreenshot20251206At1814361} />
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 rounded-[5px]" />
      </div>
    </div>
  );
}

export default function Group17() {
  return (
    <div className="relative size-full">
      <Group16 />
    </div>
  );
}