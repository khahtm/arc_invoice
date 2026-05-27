'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CHAINS = ['Ethereum', 'Base', 'Arbitrum', 'Polygon', 'Optimism'];

const SHAPES = [
  { color: '#005FFE', size: 650 },
  { color: '#FF0420', size: 440 },
  { color: '#FFCC57', size: 270 },
];


export function HeroSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const shapesRef = useRef<HTMLDivElement[]>([]);
  const targetRef = useRef({ x: -1000, y: -1000 });
  const currentRef = useRef({ x: -1000, y: -1000 });
  const activeRef = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const LERP = 0.04;
    const tick = () => {
      const cur = currentRef.current;
      const tgt = targetRef.current;
      cur.x += (tgt.x - cur.x) * LERP;
      cur.y += (tgt.y - cur.y) * LERP;
      shapesRef.current.forEach((s) => {
        if (s) s.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      targetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (!activeRef.current) {
        activeRef.current = true;
        currentRef.current = { ...targetRef.current };
      }
    };
    const onLeave = () => {
      targetRef.current = { x: -1000, y: -1000 };
      activeRef.current = false;
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      className="relative bg-white flex flex-col items-center justify-center text-center"
      style={{ minHeight: '100vh', paddingTop: '80px' }}
    >
      <div className="relative z-[2] flex flex-col items-center gap-6 px-6 max-w-5xl mx-auto">
        <div className="wk-pill-text bg-[#005FFE]/10 rounded-[26px] px-5 py-2 text-sm font-semibold text-[#005FFE]">
          <span data-text="Cross-chain USDC payments via CCTP">
            Cross-chain USDC payments via CCTP
          </span>
        </div>

        {/* Wickret-style mouse-follow heading */}
        <div ref={headerRef} className="relative cursor-default select-none">
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            aria-hidden="true"
          >
            {SHAPES.map((shape, i) => (
              <div
                key={i}
                ref={(el) => { if (el) shapesRef.current[i] = el; }}
                className="absolute rounded-full"
                style={{
                  width: shape.size, height: shape.size,
                  backgroundColor: shape.color,
                  top: -(shape.size / 2), left: -(shape.size / 2),
                  transform: 'translate3d(-1000px, -1000px, 0)',
                  willChange: 'transform',
                }}
              />
            ))}
          </div>
          <h1
            className="relative z-[1] font-bold leading-[1.05] tracking-[-0.07em] text-center text-[#2128BD] bg-white pb-4"
            style={{ mixBlendMode: 'screen', fontFamily: 'var(--font-display), sans-serif' }}
          >
            <span className="block whitespace-nowrap" style={{ fontSize: 'clamp(2rem, 7.2vw, 8.5rem)', letterSpacing: '-0.04em' }}>
              Get Paid in USDC
            </span>
            <span className="block whitespace-nowrap" style={{ fontSize: 'clamp(2rem, 7.2vw, 8.5rem)', letterSpacing: '-0.04em' }}>
              from Any Chain
            </span>
          </h1>
        </div>

        <p className="text-black text-lg md:text-xl max-w-3xl">
          Create payment links in seconds. Accept USDC from Ethereum,
          <br />
          Base, Arbitrum, Polygon, and Optimism. Instant or escrow-protected.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {CHAINS.map((chain) => (
            <span
              key={chain}
              className="wk-pill-text px-5 py-2 rounded-[26px] bg-[#005FFE]/10 text-[#005FFE] font-semibold text-sm chain-tag"
              onMouseEnter={() => {
                document.querySelectorAll(`.chain-bubble[data-chain="${chain.toLowerCase()}"]`).forEach(el => {
                  const s = (el as HTMLElement).style;
                  s.animationPlayState = 'paused';
                  s.opacity = '1';
                });
              }}
              onMouseLeave={() => {
                document.querySelectorAll(`.chain-bubble[data-chain="${chain.toLowerCase()}"]`).forEach(el => {
                  const s = (el as HTMLElement).style;
                  s.animationPlayState = 'running';
                  s.opacity = '';
                });
              }}
            >
              <span data-text={chain}>
                {chain}
              </span>
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <Link href="/dashboard">
            <Button className="rounded-[26px] px-8 py-3 h-auto bg-[#005FFE] hover:!bg-[#FF5C00] text-white font-semibold text-base transition-all duration-300 shadow-lg shadow-[#005FFE]/25 hover:scale-105 hover:shadow-xl hover:!shadow-[#FF5C00]/40 active:scale-95">
              <span className="wk-pill-text">
                <span data-text="Launch App">Launch App</span>
              </span>
              <ArrowRight className="ml-1 h-4 w-4 shrink-0" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button
              variant="outline"
              className="rounded-[26px] px-8 py-3 h-auto border-[#2128BD]/30 text-[#2128BD] hover:!bg-[#FF5C00] hover:!text-white hover:!border-[#FF5C00] font-semibold text-base bg-transparent transition-all duration-300 hover:scale-105 hover:shadow-lg hover:!shadow-[#FF5C00]/25 active:scale-95"
            >
              <span className="wk-pill-text">
                <span data-text="Learn more">Learn more</span>
              </span>
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
