interface EditCardProps {
  imageUrl: string;
  stylistName: string;
  stylistAvatar: string;
  title: string;
}

export function EditCard({ imageUrl, stylistName, stylistAvatar, title }: EditCardProps) {
  return (
    <div className="relative w-full max-w-[356px] h-[336px] shrink-0">
      {/* Triple border effect */}
      <div className="absolute inset-[2.01%] border border-[#1e1709] border-solid rounded-[8px]" />
      <div className="absolute inset-[4.03%_0_0_4.03%] border border-[#1e1709] border-solid rounded-[8px]" />
      
      {/* Main card with image */}
      <div className="absolute inset-[0_4.03%_4.03%_0] rounded-[8px] border border-[#1e1709] border-solid overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Share button - top right */}
      <div className="absolute top-[18px] right-[44px] bg-[rgba(255,254,253,0.8)] border border-[#1e1709] border-solid rounded-[20px] w-[38px] h-[38px] flex items-center justify-center z-10">
        <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 14 14">
          <path d="M12.5 0V3.5H0.5V0" stroke="#1E1709" strokeWidth="1" />
          <path d="M7 0L7 10" stroke="#1E1709" strokeLinecap="square" strokeLinejoin="round" strokeWidth="1.1" />
        </svg>
      </div>
      
      {/* Stylist badge - top left */}
      <div className="absolute top-[18px] left-[14px] bg-[rgba(255,254,253,0.8)] border border-[#1e1709] border-solid rounded-[20px] px-3 py-1.5 flex items-center gap-2 z-10">
        <div className="w-[20px] h-[20px] rounded-full overflow-hidden bg-black flex items-center justify-center">
          <img 
            src={stylistAvatar} 
            alt={stylistName}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709] tracking-[1px] uppercase">
          {stylistName}
        </span>
      </div>
      
      {/* Title button - bottom */}
      <div className="absolute bottom-[31px] left-[14px] right-[44px] bg-[rgba(255,254,253,0.8)] border border-[#1e1709] border-solid rounded-[20px] h-[36px] flex items-center justify-center z-10">
        <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709] tracking-[1px] uppercase text-center">
          {title}
        </span>
      </div>
    </div>
  );
}
