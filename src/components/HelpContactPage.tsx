import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router';

export function HelpContactPage() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[#fffefd]">
      {/* Header */}
      <div className="sticky top-0 bg-[#fffefd] h-[48px] w-full z-40 border-b border-[#1e1709]">
        <div className="h-full flex items-center justify-between px-4 max-w-[393px] mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center hover:bg-[#1e1709]/10 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#1e1709]" strokeWidth={1.5} />
          </button>
          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[16px] tracking-[2px] text-[#1e1709] uppercase">
            Help & Contact
          </p>
          <div className="w-8" />
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-[393px] mx-auto px-4 pt-8 pb-24">
        <div className="flex flex-col gap-6">
          {/* Contact Options */}
          <div className="flex flex-col gap-4">
            <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[11px] tracking-[1.5px] text-[#1e1709]/60 uppercase">
              Get in Touch
            </p>

            {/* Email Support */}
            <button
              onClick={() => window.location.href = 'mailto:support@viisevn.com'}
              className="flex items-center gap-4 p-4 bg-white border border-[#1e1709] rounded-[4px] hover:bg-[#1e1709]/5 transition-colors"
            >
              <div className="w-[48px] h-[48px] bg-[#1e1709] rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1e1709] uppercase tracking-[2px]">
                  Email Support
                </p>
              </div>
            </button>
          </div>

          {/* FAQs */}
          <div className="flex flex-col gap-4 mt-8">
            <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[11px] tracking-[1.5px] text-[#1e1709]/60 uppercase">
              Frequently Asked Questions
            </p>

            <div className="flex flex-col gap-4">
              <div className="p-4 bg-white border border-[#1e1709]/10 rounded-[4px]">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1e1709] mb-2">
                  How does the styling service work?
                </p>
                <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709]/60 leading-[18px]">
                  Submit your style preferences through our intake form, pay the styling fee, and a stylist will create a curated selection of items just for you.
                </p>
              </div>

              <div className="p-4 bg-white border border-[#1e1709]/10 rounded-[4px]">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1e1709] mb-2">
                  How much does it cost?
                </p>
                <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709]/60 leading-[18px]">
                  Our styling service costs $100 per session. This fee gives you access to personalized styling from our expert stylists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}