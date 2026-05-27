'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';

const INSTANT_PAY_FEATURES = [
  'Immediate USDC transfers',
  'Cross-chain via CCTP',
  'Dashboard & analytics',
  'Unlimited invoices',
];

const PROTECTED_PAY_FEATURES = [
  'All Instant Pay features',
  'Smart contract escrow',
  'Auto-release timer',
  'Creator refund option',
  'On-chain transparency',
];

/**
 * PricingSection — two-column pricing cards with scroll-reveal animations.
 * Instant Pay (free tier, white card) vs Protected Pay (1% fee, indigo card).
 */
export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        }),
      { threshold: 0.1 }
    );
    const els = sectionRef.current?.querySelectorAll('.wk-reveal');
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="w-full bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Label */}
        <span
          className="wk-reveal wk-pill-text text-center uppercase tracking-wider font-semibold mb-4 text-[#005FFE] bg-[#005FFE]/10 rounded-[26px] px-5 py-2"
          style={{
            fontSize: '13px',
            fontFamily: 'var(--font-display), sans-serif',
          }}
        >
          <span data-text="Pricing">Pricing</span>
        </span>

        {/* Heading */}
        <h2
          className="wk-reveal text-center font-bold mb-4 tracking-[-0.07em]"
          style={{
            color: '#2128BD',
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontFamily: 'var(--font-display), sans-serif',
            transitionDelay: '100ms',
          }}
        >
          Simple, transparent pricing
        </h2>

        {/* Subtitle */}
        <p
          className="wk-reveal text-center text-black mb-14"
          style={{ fontSize: '16px', transitionDelay: '200ms' }}
        >
          No monthly fees. Pay only when you use escrow.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Instant Pay — white card */}
          <div
            className="wk-reveal rounded-2xl border border-gray-200 bg-white p-8 flex flex-col"
            style={{ transitionDelay: '300ms' }}
          >
            <h3
              className="font-semibold mb-1"
              style={{
                color: '#2128BD',
                fontSize: '20px',
                fontFamily: 'var(--font-display), sans-serif',
              }}
            >
              Instant Pay
            </h3>
            <p className="text-black mb-6" style={{ fontSize: '14px' }}>
              Perfect for trusted clients
            </p>

            {/* Price */}
            <div className="flex items-end gap-2 mb-8">
              <span
                className="font-bold leading-none"
                style={{ color: '#2128BD', fontSize: '3rem', fontFamily: 'var(--font-display), sans-serif' }}
              >
                0%
              </span>
              <span className="text-black mb-1" style={{ fontSize: '18px' }}>
                fee
              </span>
            </div>

            {/* Features */}
            <ul className="flex flex-col gap-3">
              {INSTANT_PAY_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle2
                    size={18}
                    className="shrink-0"
                    style={{ color: '#2128BD' }}
                  />
                  <span className="text-black text-[15px]">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Protected Pay — indigo card */}
          <div
            className="wk-reveal rounded-2xl p-8 flex flex-col"
            style={{ backgroundColor: '#2128BD', transitionDelay: '400ms' }}
          >
            <h3
              className="font-semibold mb-1 text-white"
              style={{
                fontSize: '20px',
                fontFamily: 'var(--font-display), sans-serif',
              }}
            >
              Protected Pay
            </h3>
            <p className="mb-6" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
              For new clients &amp; large projects
            </p>

            {/* Price */}
            <div className="flex items-end gap-2 mb-8">
              <span
                className="font-bold leading-none text-white"
                style={{ fontSize: '3rem', fontFamily: 'var(--font-display), sans-serif' }}
              >
                1%
              </span>
              <span className="mb-1" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px' }}>
                fee
              </span>
            </div>

            {/* Features */}
            <ul className="flex flex-col gap-3">
              {PROTECTED_PAY_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle2
                    size={18}
                    className="shrink-0 text-white"
                  />
                  <span className="text-white text-[15px]">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
