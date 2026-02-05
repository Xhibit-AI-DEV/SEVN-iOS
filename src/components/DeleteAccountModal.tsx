import { AlertTriangle } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAccountModal({ isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-6"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[340px] bg-[#FFFEFD] rounded-[12px] overflow-hidden border-2 border-[#1e1709]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center pt-6 pb-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" strokeWidth={2} />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <h2 className="font-['Helvetica_Neue:Bold',sans-serif] text-[18px] text-[#1e1709] mb-3">
            Delete Account?
          </h2>
          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709]/70 leading-[20px] mb-6">
            This action cannot be undone. All your edits, likes, and profile data will be permanently deleted.
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full bg-red-600 text-white py-3 rounded-[8px] font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] uppercase hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
            <button
              onClick={onClose}
              className="w-full bg-[#1e1709] text-white py-3 rounded-[8px] font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] uppercase hover:bg-[#3e3709] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
