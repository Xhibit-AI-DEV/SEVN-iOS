import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PrivacyPolicyPage() {
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
            Privacy Policy
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
              Last updated: 01/01/2026
            </p>
            <p className="mb-6">
              This Privacy Policy explains how we collect, use, and protect your information when you use the SEVN SELECTS App (the "Service"). By using the Service, you agree to this Privacy Policy.
            </p>

            {/* 1. Who We Are */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              1. Who We Are
            </h2>
            <p className="mb-2">SEVN INC</p>
            <p className="mb-2">Contact: contact@SEVN.app</p>
            <p className="mb-6">We are the data controller for purposes of applicable data protection laws, including GDPR.</p>

            {/* 2. What We Collect */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              2. What We Collect
            </h2>
            <p className="mb-3">We collect only what is necessary to provide the Service.</p>
            <p className="mb-2 font-['Helvetica_Neue:Medium',sans-serif]">Information you provide:</p>
            <ul className="list-none space-y-1 mb-3 pl-0">
              <li>• An image of yourself that you upload</li>
              <li>• Your intake answers</li>
              <li>• Your name and email address</li>
            </ul>
            <p className="mb-2 font-['Helvetica_Neue:Medium',sans-serif]">Payment information:</p>
            <ul className="list-none space-y-1 mb-6 pl-0">
              <li>• Payments are processed by Stripe</li>
              <li>• We do not store credit card or payment details</li>
            </ul>

            {/* 3. How We Use Your Data */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              3. How We Use Your Data
            </h2>
            <p className="mb-2">We use your data only to:</p>
            <ul className="list-none space-y-1 mb-3 pl-0">
              <li>• Analyze your image and generate a style read</li>
              <li>• Review intake responses</li>
              <li>• Fulfill your purchase and curate selections</li>
              <li>• Email you your results and styling notes</li>
              <li>• Provide support if needed</li>
            </ul>
            <p className="mb-6">We do not sell your data.</p>

            {/* 4. Image Processing & AI */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              4. Image Processing & AI
            </h2>
            <p className="mb-3">Your uploaded image may be processed using third-party AI services (including OpenAI) only to provide the style analysis.</p>
            <ul className="list-none space-y-1 mb-6 pl-0">
              <li>• Images are not used for advertising</li>
              <li>• Images are not used to identify you beyond the Service</li>
              <li>• Images are not used to train public AI models</li>
            </ul>

            {/* 5. Data Storage & Retention */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              5. Data Storage & Retention
            </h2>
            <ul className="list-none space-y-1 mb-3 pl-0">
              <li>• Data is stored securely</li>
              <li>• Access is limited to what's necessary to provide the Service</li>
              <li>• Data is kept only as long as needed, unless legally required otherwise</li>
              <li>• You may request deletion of your data by contacting us</li>
            </ul>

            {/* 6. International Users (GDPR) */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              6. International Users (GDPR)
            </h2>
            <p className="mb-3">If you are in the EU or EEA:</p>
            <ul className="list-none space-y-1 mb-6 pl-0">
              <li>• Your data may be processed in the United States</li>
              <li>• We rely on appropriate safeguards, such as standard contractual clauses</li>
            </ul>

            {/* 7. Your Rights (GDPR) */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              7. Your Rights (GDPR)
            </h2>
            <p className="mb-2">You may have the right to:</p>
            <ul className="list-none space-y-1 mb-3 pl-0">
              <li>• Access your data</li>
              <li>• Correct your data</li>
              <li>• Request deletion</li>
              <li>• Withdraw consent</li>
            </ul>
            <p className="mb-6">To exercise your rights, contact contact@sevn.app</p>

            {/* 8. Minors */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              8. Minors
            </h2>
            <p className="mb-6">The Service is not intended for anyone under 18.</p>

            {/* 9. Changes */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              9. Changes
            </h2>
            <p className="mb-6">We may update this policy. Continued use means you accept the updates.</p>

            {/* 10. Contact */}
            <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 mt-6">
              10. Contact
            </h2>
            <p className="mb-6">contact@sevn.app</p>
          </div>
        </div>
      </div>
    </div>
  );
}