'use client';

interface Bubble {
  src: string; size: number; left: string;
  bottom: string; duration: number; delay: number; opacity: number;
}

const BUBBLES: Bubble[] = [
  { src: '/chains/ethereum.png', size: 48, left: '8%', bottom: '-5%', duration: 10, delay: 0, opacity: 0.22 },
  { src: '/chains/base.png', size: 44, left: '85%', bottom: '-8%', duration: 11, delay: 1.5, opacity: 0.2 },
  { src: '/chains/arbitrum.png', size: 40, left: '75%', bottom: '-3%', duration: 9, delay: 0.5, opacity: 0.18 },
  { src: '/chains/polygon.png', size: 36, left: '15%', bottom: '-12%', duration: 10.5, delay: 2, opacity: 0.18 },
  { src: '/chains/optimism.png', size: 32, left: '55%', bottom: '-6%', duration: 8.5, delay: 1, opacity: 0.15 },
  { src: '/chains/ethereum.png', size: 28, left: '40%', bottom: '-10%', duration: 8, delay: 3, opacity: 0.13 },
  { src: '/chains/base.png', size: 24, left: '65%', bottom: '-15%', duration: 7, delay: 0.8, opacity: 0.11 },
  { src: '/chains/arbitrum.png', size: 20, left: '25%', bottom: '-7%', duration: 7.5, delay: 2.5, opacity: 0.1 },
  { src: '/chains/polygon.png', size: 18, left: '90%', bottom: '-4%', duration: 6, delay: 1.2, opacity: 0.09 },
  { src: '/chains/optimism.png', size: 16, left: '48%', bottom: '-14%', duration: 5.5, delay: 0.3, opacity: 0.08 },
  { src: '/chains/ethereum.png', size: 14, left: '70%', bottom: '-9%', duration: 5, delay: 2.2, opacity: 0.07 },
  { src: '/chains/base.png', size: 12, left: '5%', bottom: '-16%', duration: 4.5, delay: 1.8, opacity: 0.06 },
];

export function ChainBubblesBackground({ subtle = false }: { subtle?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true" style={subtle ? { opacity: 0.4 } : undefined}>
      {BUBBLES.map((b, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={b.src}
          alt=""
          className="absolute select-none"
          style={{
            width: b.size, height: b.size,
            left: b.left, bottom: b.bottom,
            opacity: b.opacity,
            animation: `bubble-rise ${b.duration}s ${b.delay}s ease-in-out infinite`,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}
