import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import imgPhoneWithFrame from "figma:asset/54f42d35257b7e4ff87f0d2b41a097bb62b44b30.png";

/**
 * About Page - Premium Infrastructure Presentation
 * Styled like Apple products with tilted phone mockup
 */
export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div 
      className="fixed inset-0 w-full overflow-x-hidden overflow-y-auto bg-black" 
      style={{ 
        top: 'env(safe-area-inset-top, 0)', 
        bottom: 'env(safe-area-inset-bottom, 0)',
        left: 0,
        right: 0,
        WebkitOverflowScrolling: 'touch',
        height: '100vh',
        minHeight: '-webkit-fill-available'
      }}
    >
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="w-full max-w-[393px] mx-auto px-6 h-[56px] flex items-center justify-between">
          <button 
            onClick={() => navigate('/signin')}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={1.5} />
          </button>
          <h1 
            className="text-[13px] tracking-[2px] text-white/80 uppercase"
            style={{ fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }}
          >
            About
          </h1>
          <div className="w-8" />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[393px] mx-auto pb-20">
        
        {/* Hero Section */}
        <section className="px-6 pt-24 text-center">
          <h2 
            className="text-[40px] leading-[44px] text-white font-semibold"
            style={{ 
              fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
              letterSpacing: '-0.5%'
            }}
          >
            SEVN.
          </h2>
          <p 
            className="text-[16px] leading-[24px] text-white/60 mt-3"
            style={{ fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }}
          >
            Built for stylists.
          </p>
        </section>

        {/* Phone Mockup Section */}
        <section className="px-6 pt-[60px] pb-[60px] flex justify-center items-center">
          <div className="relative w-full max-w-[300px]">
            {/* Complete iPhone mockup with screenshot already built-in */}
            <img 
              src={imgPhoneWithFrame} 
              alt="SEVN App on iPhone" 
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* Designed for Structured Styling Section */}
        <section className="px-6">
          <h3 
            className="text-[20px] leading-[28px] text-white mb-6 font-medium"
            style={{ 
              fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
              letterSpacing: '-0.01em'
            }}
          >
            Designed for Structured Styling.
          </h3>
          
          <p 
            className="text-[16px] leading-[28px] text-white/75 mb-6"
            style={{ fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }}
          >
            Styling has always been personal. SEVN brings structure to that exchange, enabling independent stylists to deliver thoughtful, shoppable 1:1 edits through a clear and guided interface.
          </p>
          
          <p 
            className="text-[16px] leading-[28px] text-white/75"
            style={{ fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }}
          >
            Integrated affiliate revenue and client tools support lasting value for stylists. Every selection links directly to official retailer pages to maintain brand integrity.
          </p>
        </section>

        {/* Early Access Section */}
        <section className="px-6 mt-28 text-center">
          <p 
            className="text-[13px] leading-[18px] text-white/50 mb-6"
            style={{ fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }}
          >
            Access is granted on a rolling basis.
          </p>
          
          <button 
            className="w-full border border-white/30 text-white rounded-[12px] font-medium text-[15px] hover:bg-white/5 transition-colors"
            style={{ 
              fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif',
              letterSpacing: '0.01em',
              height: '52px'
            }}
            onClick={() => window.location.href = 'mailto:contact@sevn.app?subject=Request Access'}
          >
            Request Access
          </button>
        </section>

        {/* Spacing before footer divider */}
        <div className="h-24" />

        {/* Divider */}
        <div className="w-full h-[1px] bg-white/8" />

        {/* Team Section */}
        <section className="px-6 pt-16 text-center">
          <p 
            className="text-[13px] leading-[18px] text-white/50 mb-2"
            style={{ fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }}
          >
            Built by industry leaders from
          </p>
          <p 
            className="text-[13px] leading-[18px] text-white/60"
            style={{ fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }}
          >
            Hypebeast · Farfetch · Selfridges · SoundCloud
          </p>
        </section>

        {/* Footer */}
        <section className="px-6 pt-12 pb-8 text-center">
          <p 
            className="text-[13px] leading-[18px] text-white/50 mb-2"
            style={{ fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }}
          >
            For a product tour contact
          </p>
          <a 
            href="mailto:contact@sevn.app"
            className="text-[13px] leading-[18px] text-white/60 hover:text-white/80 transition-colors"
            style={{ fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }}
          >
            contact@sevn.app
          </a>
        </section>

        {/* Legal Links */}
        <section className="px-6 pb-[120px] text-center">
          <div className="flex items-center justify-center gap-4">
            <a 
              href="/terms-of-service"
              className="text-[12px] leading-[16px] text-white/40 hover:text-white/60 transition-colors"
              style={{ fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }}
            >
              Terms of Service
            </a>
            <span className="text-white/20">·</span>
            <a 
              href="/privacy-policy"
              className="text-[12px] leading-[16px] text-white/40 hover:text-white/60 transition-colors"
              style={{ fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }}
            >
              Privacy Policy
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}