'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const slides = [
  {
    title: 'Found a gig? Turn it into a deal.',
    subtitle: 'Paste any job posting — AI writes your proposal and sets up milestones.',
    cta: 'Propose Now',
    href: '/deals/propose',
    bg: 'from-[#005FFE] to-[#0040CC]',
  },
  {
    title: 'Get paid with escrow protection.',
    subtitle: 'Funds locked in smart contract until you deliver. No more chasing payments.',
    cta: 'Create Deal',
    href: '/deals/new',
    bg: 'from-[#1a1a2e] to-[#16213e]',
  },
  {
    title: 'Accept USDC from any chain.',
    subtitle: 'Clients pay from Ethereum, Base, Arbitrum, Polygon — bridged automatically.',
    cta: 'Learn More',
    href: '/deals/new',
    bg: 'from-[#0f0c29] via-[#302b63] to-[#24243e]',
  },
];

export function DealPromoBanner() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative rounded-xl overflow-hidden h-[100px]">
      {slides.map((slide, i) => {
        const isActive = i === current;
        return (
          <Link
            key={i}
            href={slide.href}
            className={`absolute inset-0 bg-gradient-to-r ${slide.bg} text-white px-6 py-5 flex items-center transition-all duration-700 ease-in-out ${
              isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="font-semibold">{slide.title}</p>
                <p className="text-sm text-white/70 mt-0.5">{slide.subtitle}</p>
              </div>
              <span className="text-sm font-medium bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5 shrink-0">
                {slide.cta} →
              </span>
            </div>
          </Link>
        );
      })}

      {/* Dots */}
      <div className="absolute bottom-2.5 left-6 flex gap-1.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
            className={`h-1 rounded-full transition-all duration-500 ${i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
}
