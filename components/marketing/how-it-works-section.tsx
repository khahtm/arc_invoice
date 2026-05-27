'use client';

import { useEffect, useRef } from 'react';

// Step data for the three-step "How it works" section
const STEPS = [
  {
    number: '01',
    title: 'Create Invoice',
    description:
      'Set the amount, choose Instant Pay or Protected Pay, and generate a unique payment link.',
  },
  {
    number: '02',
    title: 'Share Link',
    description:
      'Send the payment link to your client. They can pay from any supported chain.',
  },
  {
    number: '03',
    title: 'Get Paid',
    description:
      'USDC bridges automatically via CCTP. Funds arrive on Arc instantly or release from escrow.',
  },
];

/**
 * HowItWorksSection — three-step process overview with scroll-reveal animations.
 * Uses IntersectionObserver to add `.visible` class triggering CSS transitions.
 */
export function HowItWorksSection() {
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
      id="how-it-works"
      ref={sectionRef}
      className="w-full py-24"
      style={{ backgroundColor: '#FAFAFA' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Label */}
        <span
          className="wk-reveal wk-pill-text text-center uppercase tracking-wider font-semibold mb-4 text-[#005FFE] bg-[#005FFE]/10 rounded-[26px] px-5 py-2"
          style={{
            fontSize: '13px',
            fontFamily: 'var(--font-display), sans-serif',
          }}
        >
          <span data-text="How it works">How it works</span>
        </span>

        {/* Heading */}
        <h2
          className="wk-reveal text-center font-bold mb-16 tracking-[-0.07em]"
          style={{
            color: '#2128BD',
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontFamily: 'var(--font-display), sans-serif',
            transitionDelay: '100ms',
          }}
        >
          Get paid in 3 simple steps
        </h2>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="wk-reveal flex items-center gap-5 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm"
              style={{ transitionDelay: `${(i + 2) * 100}ms` }}
            >
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl text-white font-bold text-xl shrink-0"
                style={{
                  backgroundColor: '#2128BD',
                  fontFamily: 'var(--font-display), sans-serif',
                }}
              >
                {step.number}
              </div>

              <div className="min-w-0">
                <h3
                  className="font-semibold"
                  style={{
                    color: '#2128BD',
                    fontSize: '18px',
                    fontFamily: 'var(--font-display), sans-serif',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-black/70 leading-snug mt-0.5"
                  style={{ fontSize: '14px' }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
