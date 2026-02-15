import { ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HelpContactPage() {
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
              {/* How does the styling service work? */}
              <div className="p-4 bg-white border border-[#1e1709]/10 rounded-[4px]">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1e1709] mb-3">
                  How does the styling service work?
                </p>
                <div className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709]/75 leading-[20px] space-y-3">
                  <p>SEVN styling is built around collaboration.</p>
                  <p>Share your preferences, lifestyle, and budget through our intake form.</p>
                  <p>Join the waitlist for the stylist you connect with.</p>
                  <p>When invited, confirm and pay the styling fee.</p>
                  <p>Your stylist creates a curated edit designed specifically for you.</p>
                  <p>Each edit includes 7 intentional pieces, personalized styling notes, and direct shopping links — blending secondhand, independent brands, and community-driven finds.</p>
                  <p>Every edit supports creators and redistributes value back into our community.</p>
                </div>
              </div>

              {/* What's included in a styling edit? */}
              <div className="p-4 bg-white border border-[#1e1709]/10 rounded-[4px]">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1e1709] mb-3">
                  What's included in a styling edit?
                </p>
                <div className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709]/75 leading-[20px] space-y-3">
                  <p>Each edit includes:</p>
                  <ul className="list-none space-y-2 pl-0">
                    <li>7 curated items selected specifically for you</li>
                    <li>Personalized styling notes explaining why each piece was chosen</li>
                    <li>Direct digital shopping links for each item</li>
                  </ul>
                  <p>We focus on quality over quantity. Seven pieces, chosen with intention.</p>
                  <p>All edits are delivered digitally. SEVN does not hold inventory — we curate, you choose what to purchase.</p>
                </div>
              </div>

              {/* How much does it cost? */}
              <div className="p-4 bg-white border border-[#1e1709]/10 rounded-[4px]">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1e1709] mb-3">
                  How much does it cost?
                </p>
                <div className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709]/75 leading-[20px] space-y-3">
                  <p>Each stylist sets their own fee per edit. Pricing reflects their time, perspective, and creative approach, and may evolve as they grow.</p>
                  <p>When you join a stylist's waitlist at a specific rate, that fee is honored for you even if their pricing changes later.</p>
                  <p>We believe in transparency and fairness as we build.</p>
                </div>
              </div>

              {/* How should I fill out the intake form? */}
              <div className="p-4 bg-white border border-[#1e1709]/10 rounded-[4px]">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1e1709] mb-3">
                  How should I fill out the intake form to get the best results?
                </p>
                <div className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709]/75 leading-[20px] space-y-3">
                  <p>Your intake shapes your edit.</p>
                  <p>We recommend:</p>
                  <ul className="list-none space-y-2 pl-0">
                    <li>Writing at least 200 characters per question</li>
                    <li>Sharing visual references that genuinely reflect your style</li>
                    <li>Being clear about budget, fit, lifestyle, and what you want to avoid</li>
                  </ul>
                  <p>The more thoughtful your input, the more aligned your edit will feel.</p>
                </div>
              </div>

              {/* What happens if something sells out? */}
              <div className="p-4 bg-white border border-[#1e1709]/10 rounded-[4px]">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1e1709] mb-3">
                  What happens if something sells out?
                </p>
                <div className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709]/75 leading-[20px] space-y-3">
                  <p>Many recommendations include secondhand or limited-quantity pieces.</p>
                  <p>If an item sells out before you purchase, you can:</p>
                  <ul className="list-none space-y-2 pl-0">
                    <li>Reach out to your stylist for a replacement suggestion</li>
                    <li>Use the styling notes to guide a similar find</li>
                  </ul>
                  <p>Discovery and timing are part of the process but we'll always aim to support you.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}