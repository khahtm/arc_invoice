'use client';

interface BubbleLogo {
  src: string; size: number; left: string;
  bottom: string; duration: number; delay: number; opacity: number;
}

const CHAIN_LOGOS: BubbleLogo[] = [
  // Extra Large
  { src: '/chains/ethereum.png', size: 56, left: '6%', bottom: '-3%', duration: 9, delay: 0, opacity: 0.35 },
  { src: '/chains/base.png', size: 52, left: '88%', bottom: '-6%', duration: 10, delay: 1, opacity: 0.35 },
  { src: '/chains/polygon.png', size: 50, left: '93%', bottom: '-2%', duration: 9.5, delay: 0.5, opacity: 0.33 },
  { src: '/chains/optimism.png', size: 48, left: '78%', bottom: '-8%', duration: 10.5, delay: 1.5, opacity: 0.33 },
  { src: '/chains/arbitrum.png', size: 54, left: '3%', bottom: '-10%', duration: 11, delay: 2, opacity: 0.33 },
  // Large
  { src: '/chains/ethereum.png', size: 42, left: '18%', bottom: '-5%', duration: 8, delay: 0.3, opacity: 0.28 },
  { src: '/chains/base.png', size: 38, left: '72%', bottom: '-12%', duration: 8.5, delay: 2, opacity: 0.28 },
  { src: '/chains/arbitrum.png', size: 40, left: '40%', bottom: '-7%', duration: 9, delay: 1.2, opacity: 0.25 },
  { src: '/chains/polygon.png', size: 36, left: '60%', bottom: '-15%', duration: 7.5, delay: 0.8, opacity: 0.25 },
  { src: '/chains/optimism.png', size: 38, left: '28%', bottom: '-9%', duration: 8, delay: 3, opacity: 0.25 },
  // Medium — wave 1
  { src: '/chains/ethereum.png', size: 30, left: '20%', bottom: '-15%', duration: 7, delay: 0.8, opacity: 0.2 },
  { src: '/chains/base.png', size: 26, left: '38%', bottom: '-6%', duration: 7.5, delay: 2.5, opacity: 0.18 },
  { src: '/chains/polygon.png', size: 28, left: '65%', bottom: '-18%', duration: 6.5, delay: 1.2, opacity: 0.18 },
  { src: '/chains/arbitrum.png', size: 24, left: '50%', bottom: '-9%', duration: 8, delay: 3, opacity: 0.16 },
  { src: '/chains/optimism.png', size: 26, left: '30%', bottom: '-20%', duration: 7, delay: 4, opacity: 0.16 },
  // Medium — wave 2
  { src: '/chains/ethereum.png', size: 28, left: '70%', bottom: '-7%', duration: 7.5, delay: 0.3, opacity: 0.18 },
  { src: '/chains/base.png', size: 32, left: '12%', bottom: '-14%', duration: 8, delay: 1.8, opacity: 0.2 },
  { src: '/chains/polygon.png', size: 26, left: '55%', bottom: '-10%', duration: 6, delay: 3.5, opacity: 0.16 },
  { src: '/chains/arbitrum.png', size: 30, left: '42%', bottom: '-16%', duration: 7, delay: 0.7, opacity: 0.18 },
  { src: '/chains/optimism.png', size: 24, left: '88%', bottom: '-5%', duration: 6.5, delay: 2.2, opacity: 0.16 },
  // Medium — wave 3
  { src: '/chains/ethereum.png', size: 26, left: '83%', bottom: '-11%', duration: 7, delay: 1.5, opacity: 0.17 },
  { src: '/chains/base.png', size: 28, left: '48%', bottom: '-4%', duration: 6.5, delay: 0.2, opacity: 0.18 },
  { src: '/chains/polygon.png', size: 24, left: '8%', bottom: '-13%', duration: 7.5, delay: 2.8, opacity: 0.16 },
  { src: '/chains/arbitrum.png', size: 26, left: '73%', bottom: '-17%', duration: 6, delay: 1, opacity: 0.17 },
  { src: '/chains/optimism.png', size: 22, left: '35%', bottom: '-8%', duration: 5.5, delay: 3.2, opacity: 0.14 },
  // Small — fast risers wave 1
  { src: '/chains/ethereum.png', size: 18, left: '95%', bottom: '-7%', duration: 5, delay: 0.5, opacity: 0.1 },
  { src: '/chains/base.png', size: 16, left: '45%', bottom: '-14%', duration: 5.5, delay: 1.5, opacity: 0.08 },
  { src: '/chains/polygon.png', size: 14, left: '15%', bottom: '-11%', duration: 4.5, delay: 2.5, opacity: 0.08 },
  { src: '/chains/arbitrum.png', size: 16, left: '58%', bottom: '-16%', duration: 6, delay: 0, opacity: 0.09 },
  { src: '/chains/optimism.png', size: 12, left: '82%', bottom: '-4%', duration: 5, delay: 2, opacity: 0.07 },
  // Small — fast risers wave 2
  { src: '/chains/ethereum.png', size: 14, left: '35%', bottom: '-8%', duration: 4, delay: 1, opacity: 0.07 },
  { src: '/chains/base.png', size: 12, left: '78%', bottom: '-12%', duration: 4.5, delay: 0, opacity: 0.06 },
  { src: '/chains/polygon.png', size: 16, left: '25%', bottom: '-6%', duration: 5, delay: 3, opacity: 0.08 },
  { src: '/chains/arbitrum.png', size: 14, left: '62%', bottom: '-15%', duration: 4, delay: 1.8, opacity: 0.07 },
  { src: '/chains/optimism.png', size: 10, left: '48%', bottom: '-9%', duration: 3.5, delay: 0.5, opacity: 0.05 },
  // Small — fast risers wave 3
  { src: '/chains/ethereum.png', size: 12, left: '52%', bottom: '-3%', duration: 4.5, delay: 0.7, opacity: 0.06 },
  { src: '/chains/base.png', size: 14, left: '22%', bottom: '-16%', duration: 5, delay: 2.3, opacity: 0.07 },
  { src: '/chains/polygon.png', size: 10, left: '68%', bottom: '-7%', duration: 3.5, delay: 1.3, opacity: 0.05 },
  { src: '/chains/arbitrum.png', size: 12, left: '10%', bottom: '-19%', duration: 4, delay: 0.4, opacity: 0.06 },
  { src: '/chains/optimism.png', size: 14, left: '90%', bottom: '-11%', duration: 4.5, delay: 2.8, opacity: 0.07 },
];

export function ChainBubblesOverlay() {
  return (
    <div
      className="fixed inset-0 z-[1] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {CHAIN_LOGOS.map((logo, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={logo.src}
          alt=""
          data-chain={logo.src.split('/').pop()?.replace('.png', '')}
          className="absolute select-none chain-bubble"
          style={{
            width: logo.size, height: logo.size,
            left: logo.left, bottom: logo.bottom,
            '--bubble-opacity': logo.opacity,
            opacity: logo.opacity,
            animation: `bubble-rise ${logo.duration}s ${logo.delay}s ease-in-out infinite`,
            willChange: 'transform',
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
