'use client';

// Wickret-inspired auto-scrolling marquee strip for marketing page mid-sections.
// Uses CSS class `wk-marquee-track` (animation defined in globals.css) for seamless loop.

const ITEMS = [
  'Cross-Chain Payments',
  'Zero Fee Instant Pay',
  'Escrow Protection',
  'CCTP Bridge',
  'Multi-Chain USDC',
  'Auto-Release Timer',
];

// Dot separator rendered between each item
function Dot() {
  return (
    <span
      className="mx-6 text-[#2128BD] select-none"
      aria-hidden="true"
    >
      •
    </span>
  );
}

// A single set of marquee items
function MarqueeItems() {
  return (
    <>
      {ITEMS.map((item, i) => (
        <span key={i} className="inline-flex items-center shrink-0">
          <span
            className="text-[18px] font-semibold text-[#2128BD] uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            {item}
          </span>
          <Dot />
        </span>
      ))}
    </>
  );
}

/**
 * BenefitsMarquee
 * Full-width light-gray auto-scrolling strip with key product benefits.
 * Items are duplicated to create a seamless infinite loop.
 */
export function BenefitsMarquee() {
  return (
    <div
      className="w-full bg-[#F5F5F7] py-5 overflow-hidden"
      aria-label="Product benefits"
    >
      {/* wk-marquee-track applies the marquee-scroll keyframe animation */}
      <div className="wk-marquee-track flex whitespace-nowrap">
        {/* First set */}
        <MarqueeItems />
        {/* Duplicate for seamless loop — translateX(-50%) in keyframe lands back at start */}
        <MarqueeItems />
      </div>
    </div>
  );
}
