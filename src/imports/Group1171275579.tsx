import imgScreenshot20231117At12528 from "figma:asset/4b4531903296dd337e2503bb17f59748fdc6c9ee.png";
import imgScreenshot20231117At12529 from "figma:asset/fecf94a9418e54b88d39fd7f742c93a62efe3681.png";
import imgScreenshot20231117At12530 from "figma:asset/e5bc1785182cd70f2c8e4322898429585da016f2.png";
import imgScreenshot20231117At12531 from "figma:asset/35d298000e4247f8037c4cf8a00ad6833b84342a.png";
import imgScreenshot20231117At12532 from "figma:asset/d2bff1a3ce8fdc79b92849f71cc2dd43208199dd.png";

function Group() {
  return (
    <div className="absolute contents inset-[82.89%_3.66%_5.21%_0]">
      <div className="absolute bg-[rgba(255,254,253,0.8)] border border-[#1e1709] border-solid inset-[82.89%_3.66%_5.21%_0] rounded-[20px]" />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents inset-[82.89%_3.66%_5.21%_0]">
      <Group />
      <div className="absolute flex flex-col font-['Helvetica_Neue:Regular',sans-serif] inset-[84.04%_27.71%_7.11%_28.46%] justify-center leading-[0] not-italic text-[#1e1709] text-[13px] text-center tracking-[1px] uppercase">
        <p className="leading-[22px] whitespace-pre-wrap">Lilly Tanaka</p>
      </div>
    </div>
  );
}

export default function Group2() {
  return (
    <div className="relative size-full">
      <div className="absolute inset-[0_0_0_0.75%] pointer-events-none rounded-[350px]" data-name="Screenshot 2023-11-17 at 12.52 8">
        <div aria-hidden="true" className="absolute inset-0 rounded-[350px]">
          <img alt="" className="absolute max-w-none object-cover rounded-[350px] size-full" src={imgScreenshot20231117At12528} />
          <img alt="" className="absolute max-w-none object-cover rounded-[350px] size-full" src={imgScreenshot20231117At12529} />
          <img alt="" className="absolute max-w-none object-cover rounded-[350px] size-full" src={imgScreenshot20231117At12530} />
          <img alt="" className="absolute max-w-none object-cover rounded-[350px] size-full" src={imgScreenshot20231117At12531} />
          <img alt="" className="absolute max-w-none object-cover rounded-[350px] size-full" src={imgScreenshot20231117At12532} />
        </div>
        <div aria-hidden="true" className="absolute border border-[#1e1709] border-solid inset-0 rounded-[350px]" />
      </div>
      <Group1 />
    </div>
  );
}