import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TermsOfServicePage() {
  const navigate = useNavigate();

  return (
    <div 
      className="relative w-full min-h-screen overflow-x-hidden bg-[#fffefd]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#fffefd] h-[48px] w-full z-40 border-b border-[#1e1709]">
        <div className="flex items-center h-full px-4 max-w-[393px] mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center hover:bg-[#1e1709]/10 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#1e1709]" strokeWidth={1.5} />
          </button>
          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[16px] tracking-[2px] text-[#1e1709] uppercase">
            Terms of Service
          </p>
          <div className="w-8" />
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-[393px] mx-auto px-4 pt-8" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
        <div className="flex flex-col gap-6">
          <div className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] leading-[20px] text-[#1e1709]/85">
            
            {/* Header */}
            <p className="mb-2 font-['Helvetica_Neue:Medium',sans-serif]">
              Last updated: 1/26/2026
            </p>
            <p className="mb-6">
              These Terms of Service ("Terms") govern your use of the SEVN SELECTS service (the "Service"), operated by SEVN INC ("we," "us," or "our").
            </p>
            <p className="mb-6">
              By using the Service or completing a purchase, you agree to these Terms. If you do not agree, please do not use the Service.
            </p>

            {/* 1. The Service */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              1. The Service
            </h2>
            <p className="mb-2">SEVN SELECTS provides:</p>
            <ul className="list-none space-y-1 mb-6 pl-0">
              <li>• Image-based style analysis</li>
              <li>• Intake questions</li>
              <li>• The option to purchase a personalized "7-Select" curated by Lissy Roddy</li>
              <li>• Delivery of curated selections and styling notes via email within approximately two weeks</li>
            </ul>

            {/* 2. Eligibility */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              2. Eligibility
            </h2>
            <p className="mb-3">You must be 18 years or older to use the Service.</p>
            <p className="mb-2">You confirm that:</p>
            <ul className="list-none space-y-1 mb-6 pl-0">
              <li>• You have the right to upload the image you submit</li>
              <li>• The information you provide is accurate</li>
            </ul>

            {/* 3. No Account Required */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              3. No Account Required
            </h2>
            <p className="mb-6">No account is required. Use of the Service is provided on a per-submission and per-purchase basis.</p>

            {/* 4. User Content */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              4. User Content
            </h2>
            <p className="mb-3">You retain ownership of any image and information you submit.</p>
            <p className="mb-2">By submitting content, you grant SEVN INC a limited, non-exclusive license to use that content solely to:</p>
            <ul className="list-none space-y-1 mb-3 pl-0">
              <li>• Provide the Service</li>
              <li>• Generate style analysis</li>
              <li>• Deliver curated selections and styling notes</li>
            </ul>
            <p className="mb-6">Your content is not used for marketing purposes.</p>

            {/* 5. AI Output Disclaimer */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              5. AI Output Disclaimer
            </h2>
            <p className="mb-3">The Service uses automated and AI-assisted tools to generate style insights.</p>
            <p className="mb-2">You understand and agree that:</p>
            <ul className="list-none space-y-1 mb-6 pl-0">
              <li>• Style recommendations are subjective</li>
              <li>• Results are informational only</li>
              <li>• No professional or guaranteed advice is provided</li>
            </ul>

            {/* 6. Purchases & Payments */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              6. Purchases & Payments
            </h2>
            <ul className="list-none space-y-1 mb-6 pl-0">
              <li>• Prices are displayed at checkout (typically $100 USD)</li>
              <li>• Payments are processed securely through Stripe</li>
              <li>• SEVN INC does not store payment card information</li>
            </ul>

            {/* 7. Refund Policy */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              7. Refund Policy
            </h2>
            <p className="mb-3">Because the Service is personalized and begins immediately after payment:</p>
            <ul className="list-none space-y-1 mb-3 pl-0">
              <li>• All sales are final once the service has started</li>
              <li>• This includes image analysis, intake review, and curation work</li>
            </ul>
            <p className="mb-2 font-['Helvetica_Neue:Medium',sans-serif]">For users in the EU or EEA:</p>
            <ul className="list-none space-y-1 mb-6 pl-0">
              <li>• By completing your purchase, you expressly consent to the immediate performance of the Service</li>
              <li>• You acknowledge that you waive your 14-day right of withdrawal under EU consumer law</li>
            </ul>

            {/* 8. Delivery Timeline */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              8. Delivery Timeline
            </h2>
            <p className="mb-3">Curated selections and styling notes are typically delivered within two weeks of purchase.</p>
            <p className="mb-6">Delays may occur due to volume or circumstances beyond our control. We will notify you if timelines change.</p>

            {/* 9. Intellectual Property */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              9. Intellectual Property
            </h2>
            <p className="mb-6">All materials provided through the Service, excluding your submitted content, are the property of SEVN INC or its licensors and may not be copied, distributed, or used without permission.</p>

            {/* 10. Prohibited Use */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              10. Prohibited Use
            </h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-none space-y-1 mb-6 pl-0">
              <li>• Upload images you do not have the right to use</li>
              <li>• Use the Service for unlawful purposes</li>
              <li>• Attempt to interfere with or misuse the Service</li>
            </ul>

            {/* 11. Limitation of Liability */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              11. Limitation of Liability
            </h2>
            <p className="mb-3">The Service is provided "as is" and "as available."</p>
            <p className="mb-3">To the maximum extent permitted by law, SEVN INC's total liability shall not exceed the amount paid for the Service.</p>
            <p className="mb-6">Nothing in these Terms limits rights that cannot be excluded under applicable law.</p>

            {/* 12. Governing Law */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              12. Governing Law
            </h2>
            <p className="mb-6">These Terms are governed by the laws of the United States, without limiting mandatory consumer protections applicable in your country of residence.</p>

            {/* 13. Changes */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              13. Changes
            </h2>
            <p className="mb-6">We may update these Terms from time to time. Continued use of the Service constitutes acceptance of the updated Terms.</p>

            {/* 14. Contact */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              14. Contact
            </h2>
            <p className="mb-2">For questions about these Terms or the Service, contact:</p>
            <p className="mb-6">contact@sevn.app</p>
          </div>
        </div>
      </div>
    </div>
  );
}