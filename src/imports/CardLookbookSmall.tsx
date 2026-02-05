import svgPaths from "./svg-iw865v5fs4";
import imgScreenshot20231117At12528 from "figma:asset/d0c7bb1210427a1c21fa2047a569ee540dc924ed.png";

function Group() {
  return (
    <div className="absolute contents inset-[79.87%_8.05%_9.4%_4.03%]">
      <div className="absolute bg-[rgba(255,254,253,0.8)] border border-[#1e1709] border-solid inset-[79.87%_8.05%_9.4%_4.03%] rounded-[20px]" />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents inset-[79.87%_8.05%_9.4%_4.03%]">
      <Group />
      <div className="absolute flex flex-col font-['Helvetica_Neue:Regular',sans-serif] inset-[81.18%_35.88%_10.88%_31.52%] justify-center leading-[0] not-italic text-[#1e1709] text-[13px] text-center tracking-[1px] uppercase">
        <p className="css-4hzbpn leading-[22px]">CHRIS WHYL</p>
      </div>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents inset-0">
      <div className="absolute bg-[rgba(255,254,253,0.8)] border border-[#1e1709] border-solid inset-0 rounded-[20px]" />
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents left-[10px] top-[10px]">
      <div className="absolute h-[3.5px] left-[10px] top-[18px] w-[12px]">
        <div className="absolute inset-[0_-4.17%_-14.29%_-4.17%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 4">
            <path d="M12.5 0V3.5H0.5V0" id="Vector 8" stroke="var(--stroke-0, black)" />
          </svg>
        </div>
      </div>
      <div className="absolute h-[7.5px] left-[14px] top-[10px] w-[4.5px]" data-name="Vector">
        <div className="absolute inset-[-7.33%_-17.28%]" style={{ "--stroke-0": "rgba(30, 23, 9, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.05563 8.6">
            <path d={svgPaths.pae6f600} id="Vector" stroke="var(--stroke-0, #1E1709)" strokeLinecap="square" strokeLinejoin="round" strokeWidth="1.1" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function IconShare() {
  return (
    <div className="absolute inset-[5.37%_8.05%_83.89%_81.21%]" data-name="Icon/share">
      <Group4 />
      <Group6 />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-[5.37%_8.05%_83.89%_81.21%]">
      <IconShare />
    </div>
  );
}

function Group8() {
  return (
    <div className="absolute contents inset-[calc(5.05%-1px)_calc(4.71%-1px)_calc(4.69%-1px)_calc(4.03%-1px)]">
      <div className="absolute inset-[5.05%_4.71%_4.69%_4.71%] pointer-events-none rounded-[350px]" data-name="Screenshot 2023-11-17 at 12.52 8">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[350px] size-full" src={imgScreenshot20231117At12528} />
        <div aria-hidden="true" className="absolute border border-[#1e1709] border-solid inset-0 rounded-[350px]" />
      </div>
      <Group1 />
      <Group2 />
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents inset-0">
      <div className="absolute bg-[rgba(255,254,253,0.8)] border border-[#1e1709] border-solid inset-0 rounded-[20px]" />
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute contents left-[10px] top-[10px]">
      <div className="absolute h-[3.5px] left-[10px] top-[18px] w-[12px]">
        <div className="absolute inset-[0_-4.17%_-14.29%_-4.17%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 4">
            <path d="M12.5 0V3.5H0.5V0" id="Vector 8" stroke="var(--stroke-0, black)" />
          </svg>
        </div>
      </div>
      <div className="absolute h-[7.5px] left-[14px] top-[10px] w-[4.5px]" data-name="Vector">
        <div className="absolute inset-[-7.33%_-17.28%]" style={{ "--stroke-0": "rgba(30, 23, 9, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.05563 8.6">
            <path d={svgPaths.pae6f600} id="Vector" stroke="var(--stroke-0, #1E1709)" strokeLinecap="square" strokeLinejoin="round" strokeWidth="1.1" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function IconShare1() {
  return (
    <div className="absolute inset-[5.37%_8.05%_83.89%_81.21%]" data-name="Icon/share">
      <Group5 />
      <Group7 />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents inset-[5.37%_8.05%_83.89%_81.21%]">
      <IconShare1 />
    </div>
  );
}

function Group9() {
  return (
    <div className="absolute contents inset-[calc(5.37%-1px)_calc(8.05%-1px)_calc(83.89%-1px)_calc(81.21%-1px)]">
      <Group3 />
    </div>
  );
}

export default function CardLookbookSmall() {
  return (
    <div className="border border-black border-solid relative size-full" data-name="Card/Lookbook/Small">
      <Group8 />
      <Group9 />
    </div>
  );
}