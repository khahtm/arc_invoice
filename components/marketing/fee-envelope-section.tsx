'use client';

import { useEffect } from 'react';

// Wickret-inspired large statement section: "It's Your Money / Stop Paying Fees".
// Uses IntersectionObserver to trigger .wk-reveal animations (defined in globals.css).

/**
 * FeeEnvelopeSection
 * Full-width, ~80vh centered content block with a massive two-line heading,
 * subtitle, and subtle floating dot decorations.
 */
export function FeeEnvelopeSection() {
  // Attach IntersectionObserver to all .wk-reveal elements in this section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.wk-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="relative w-full bg-white overflow-hidden flex items-center justify-center"
      style={{ minHeight: '80vh' }}
    >
      {/* Floating chain logo decorations */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/chains/optimism.png" alt="" className="absolute pointer-events-none" style={{ width: 32, top: '18%', left: '8%', opacity: 0.5, animation: 'float-slow 8s ease-in-out infinite' }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/chains/polygon.png" alt="" className="absolute pointer-events-none" style={{ width: 28, bottom: '20%', right: '10%', opacity: 0.5, animation: 'float-medium 10s ease-in-out infinite' }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/chains/arbitrum.png" alt="" className="absolute pointer-events-none" style={{ width: 26, top: '55%', left: '85%', opacity: 0.4, animation: 'float-fast 7s ease-in-out infinite' }} />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-8 max-w-4xl mx-auto py-24">
        {/* Small label */}
        <span
          className="wk-reveal wk-pill-text uppercase tracking-wider text-[#005FFE] font-semibold mb-6 bg-[#005FFE]/10 rounded-[26px] px-5 py-2"
          style={{
            fontSize: 13,
            fontFamily: 'var(--font-display), sans-serif',
          }}
        >
          <span data-text="Zero Fees">Zero Fees</span>
        </span>

        {/* Massive two-line heading */}
        <h2
          className="wk-reveal text-[#2128BD] font-bold leading-tight tracking-[-0.07em]"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontFamily: 'var(--font-display), sans-serif',
            transitionDelay: '0.1s',
          }}
        >
          It&apos;s Your Money
          <br />
          Stop Paying Fees
        </h2>

        {/* Subtitle */}
        <p
          className="wk-reveal text-black max-w-lg mx-auto mt-6"
          style={{
            fontSize: 18,
            fontFamily: 'var(--font-display), sans-serif',
            lineHeight: 1.7,
            transitionDelay: '0.2s',
          }}
        >
          Instant Pay transfers are completely free. No monthly fees, no hidden
          charges. You keep every USDC.
        </p>
      </div>
    </section>
  );
}
