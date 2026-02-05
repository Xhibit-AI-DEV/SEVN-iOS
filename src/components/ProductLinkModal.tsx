import { X } from 'lucide-react';

interface ProductLinkModalProps {
  url: string;
  title?: string;
  onClose: () => void;
}

export function ProductLinkModal({ url, title, onClose }: ProductLinkModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[393px] h-[90vh] rounded-[8px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1709]">
          <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1e1709] truncate flex-1">
            {title || 'Product Link'}
          </p>
          <button
            onClick={onClose}
            className="shrink-0 ml-2 w-8 h-8 flex items-center justify-center hover:bg-[#f5f5f5] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#1e1709]" />
          </button>
        </div>

        {/* iframe */}
        <iframe
          src={url}
          className="flex-1 w-full border-0"
          title={title || 'Product'}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
