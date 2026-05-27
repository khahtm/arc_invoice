'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * CtaSection — full-width indigo call-to-action banner.
 * Prompts users to connect wallet and launch the app with no signup required.
 */
export function CtaSection() {
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
    <section
      ref={sectionRef}
      className="w-full py-24"
      style={{ backgroundColor: '#2128BD' }}
    >
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Heading */}
        <h2
          className="wk-reveal font-bold text-white mb-6 tracking-[-0.07em]"
          style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontFamily: 'var(--font-display), sans-serif',
          }}
        >
          Ready to get started?
        </h2>

        {/* Subtitle */}
        <p
          className="wk-reveal mb-10 max-w-xl leading-relaxed"
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '18px',
            transitionDelay: '100ms',
          }}
        >
          Connect your wallet, create an invoice, and accept USDC from any
          chain. No signup required.
        </p>

        {/* CTA button */}
        <div className="wk-reveal" style={{ transitionDelay: '200ms' }}>
          <Link href="/dashboard">
            <Button
              className="rounded-full px-8 py-3 h-auto text-base font-semibold bg-white hover:!bg-[#FF5C00] hover:!text-white transition-all duration-300 items-center gap-2 hover:scale-105 hover:shadow-lg hover:!shadow-[#FF5C00]/30 active:scale-95"
              style={{
                color: '#2128BD',
                fontFamily: 'var(--font-display), sans-serif',
              }}
            >
              <span className="wk-pill-text">
                <span data-text="Launch App">Launch App</span>
              </span>
              <ArrowRight size={18} className="shrink-0" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
