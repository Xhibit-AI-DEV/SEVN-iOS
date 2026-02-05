import imgScreenshot20231117At12528 from "figma:asset/d0c7bb1210427a1c21fa2047a569ee540dc924ed.png";

function Group() {
  return (
    <div className="absolute contents inset-[80%_5.97%_9.26%_6.11%]">
      <div className="absolute bg-[rgba(255,254,253,0.8)] border border-[#1e1709] border-solid inset-[80%_5.97%_9.26%_6.11%] rounded-[20px]" />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents inset-[80%_5.97%_9.26%_6.11%]">
      <Group />
      <div className="absolute flex flex-col font-['Helvetica_Neue:Regular',sans-serif] inset-[81.32%_33.79%_10.74%_33.6%] justify-center leading-[0] not-italic text-[#1e1709] text-[16px] text-center tracking-[1px] uppercase">
        <p className="css-4hzbpn leading-[22px]">CHRIS WHYL</p>
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-[calc(5.05%-1px)_calc(4.71%-1px)_calc(4.69%-1px)_calc(4.71%-1px)]">
      <div className="absolute inset-[5.05%_4.71%_4.69%_4.71%] pointer-events-none rounded-[350px]" data-name="Screenshot 2023-11-17 at 12.52 8">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[350px] size-full" src={imgScreenshot20231117At12528} />
        <div aria-hidden="true" className="absolute border border-[#1e1709] border-solid inset-0 rounded-[350px]" />
      </div>
      <Group1 />
    </div>
  );
}

function CardLookbookSmall() {
  return (
    <div className="absolute border border-black border-solid left-0 rounded-[5px] size-[360px] top-0" data-name="Card/Lookbook/Small">
      <Group2 />
    </div>
  );
}

export default function Group3() {
  return (
    <div className="relative size-full">
      <CardLookbookSmall />
    </div>
  );
}