import imgScreenshot20231117At12528 from "figma:asset/4b4531903296dd337e2503bb17f59748fdc6c9ee.png";
import imgScreenshot20231117At12529 from "figma:asset/7ba87817f8223271b091058d7d6c574cf1ba0452.png";
import img021 from "figma:asset/e848b14a74d352089a614d152282f09191ed8fc0.png";
import img22 from "figma:asset/9f1f3c2c66a18611ca3dc256be40c92f256300b5.png";
import img23 from "figma:asset/018d91ae7d1519157480541eba566ed2d99456a2.png";

function CardLookbookBig() {
  return (
    <div className="absolute h-[386.111px] left-0 top-0 w-[299px]" data-name="Card/Lookbook/Big">
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

export default function Group() {
  return (
    <div className="relative size-full">
      <CardLookbookBig />
      <div className="absolute h-[368.153px] left-0 pointer-events-none rounded-[8px] top-0 w-[286px]" data-name="0_2 1">
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