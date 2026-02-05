import imgScreenshot20231117At12528 from "figma:asset/4b4531903296dd337e2503bb17f59748fdc6c9ee.png";
import imgScreenshot20231117At12529 from "figma:asset/7ba87817f8223271b091058d7d6c574cf1ba0452.png";
import img021 from "figma:asset/e848b14a74d352089a614d152282f09191ed8fc0.png";
import img22 from "figma:asset/9f1f3c2c66a18611ca3dc256be40c92f256300b5.png";
import img23 from "figma:asset/2100215bdb3f74706b3cf7fa51529271f7ee431e.png";

function CardLookbookBig() {
  return (
    <div className="col-1 h-[543px] ml-0 mt-0 relative row-1 w-[363px]" data-name="Card/Lookbook/Big">
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

function Group() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-0 mt-0 relative row-1">
      <CardLookbookBig />
      <div className="col-1 h-[517.744px] ml-0 mt-0 pointer-events-none relative rounded-[8px] row-1 w-[347.217px]" data-name="0_2 1">
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

function Group1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <Group />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col h-[341px] items-start px-[16px] relative shrink-0">
      <Group1 />
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full">
      <Frame />
    </div>
  );
}