import svgPaths from "./svg-110l64nqxy";
import imgScreenshot20231117At12524 from "figma:asset/557e4ca658e2ff37cf2dda18e4534c106ec861c0.png";
import imgScreenshot20231117At12525 from "figma:asset/e4b87ad125820c87df00cd6e705bde4e8af3e67e.png";
import imgScreenshot20231117At12528 from "figma:asset/4b4531903296dd337e2503bb17f59748fdc6c9ee.png";
import imgScreenshot20231117At12529 from "figma:asset/7ba87817f8223271b091058d7d6c574cf1ba0452.png";
import img021 from "figma:asset/e848b14a74d352089a614d152282f09191ed8fc0.png";
import img22 from "figma:asset/9f1f3c2c66a18611ca3dc256be40c92f256300b5.png";

function RightSide() {
  return (
    <div className="absolute h-[9.931px] left-[calc(83.33%+17.41px)] top-[12px] translate-x-[-50%] w-[57.824px]" data-name="Right Side">
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

function Create() {
  return (
    <div className="absolute bg-white h-[1299px] left-[3px] overflow-clip top-0 w-[390px]" data-name="Create">
      {[...Array(2).keys()].map((_, i) => (
        <StatusBarIPhone1313Pro key={i} />
      ))}
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

function Frame() {
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
        <p className="css-ew64yg leading-[22px]">LISSY Roddy</p>
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

function Frame1() {
  return <div className="h-px opacity-50 shrink-0 w-[361px]" />;
}

function Frame5() {
  return <div className="h-0 opacity-50 shrink-0 w-[361px]" />;
}

function Component2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[14px] h-[400.756px] items-center left-[3px] px-[16px] rounded-[8px] top-[49.3px] w-[390px]" data-name=".">
      <Frame />
      <Component1 />
      <Frame1 />
      <p className="css-4hzbpn font-['Helvetica_Neue:Regular',sans-serif] leading-[30px] not-italic relative shrink-0 text-[16px] text-black text-center tracking-[1px] uppercase w-[361px]">SLEEK DIRECTIONAL EDITS WITH EFFORTLESS PRECISION.</p>
      <Frame5 />
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

function Group4() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <CardLookbookBig />
      <div className="col-1 h-[368.153px] ml-0 mt-0 pointer-events-none relative rounded-[8px] row-1 w-[286px]" data-name="0_2 1">
        <div aria-hidden="true" className="absolute inset-0 rounded-[8px]">
          <img alt="" className="absolute max-w-none object-cover rounded-[8px] size-full" src={img021} />
          <img alt="" className="absolute max-w-none object-cover rounded-[8px] size-full" src={img22} />
          <img alt="" className="absolute max-w-none object-cover rounded-[8px] size-full" src={img021} />
        </div>
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 rounded-[8px]" />
      </div>
    </div>
  );
}

function Frame4() {
  return <div className="h-px opacity-50 shrink-0 w-[361px]" />;
}

function Frame3() {
  return <div className="h-px opacity-50 w-[361px]" />;
}

function Frame2() {
  return <div className="h-0 opacity-50 shrink-0 w-[361px]" />;
}

function ButtonDark() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-center justify-center relative shrink-0" data-name="Button/Dark">
      <div className="h-[52px] relative shrink-0 w-[361px]">
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
      <div className="absolute css-g0mm18 flex flex-col font-['Helvetica_Neue:Bold',sans-serif] justify-center leading-[0] left-[calc(50%-0.5px)] not-italic text-[#fffefd] text-[16px] text-center top-[26px] translate-x-[-50%] translate-y-[-50%]">
        <p className="css-ew64yg leading-[18px]">GET STYLED</p>
      </div>
    </div>
  );
}

function Component3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[9px] h-[638.584px] items-center left-0 px-[16px] rounded-[8px] top-[582.67px]" data-name=".">
      <Group4 />
      {[...Array(2).keys()].map((_, i) => (
        <Frame4 key={i} />
      ))}
      <p className="css-4hzbpn font-['Helvetica_Neue:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e1709] text-[18px] text-center tracking-[2px] uppercase w-[361px]">1:1 Styling</p>
      <p className="css-4hzbpn font-['Helvetica_Neue:Light',sans-serif] leading-[25px] not-italic relative shrink-0 text-[#1e1709] text-[14px] text-center tracking-[1px] uppercase w-[333px]">Upload a Reference pic To get started</p>
      <div className="flex items-center justify-center relative shrink-0">
        <div className="flex-none scale-y-[-100%]">
          <Frame3 />
        </div>
      </div>
      <Frame2 />
      <ButtonDark />
    </div>
  );
}

export default function Group7() {
  return (
    <div className="relative size-full">
      <Group5 />
      <Group6 />
      <p className="absolute css-4hzbpn font-['Helvetica_Neue:Regular',sans-serif] h-[21.308px] leading-[22px] left-[198px] not-italic text-[24px] text-black text-center top-[68.77px] tracking-[3px] translate-x-[-50%] uppercase w-[390px]">SEVN SELECTS</p>
      <Component3 />
    </div>
  );
}