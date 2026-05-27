'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

/**
 * MarketingHeader — sticky navigation with scroll-aware background transition.
 * Transparent on top, transitions to white + shadow as user scrolls down.
 */
export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white shadow-sm border-b border-gray-100'
          : 'bg-transparent',
      ].join(' ')}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo-new.png"
            alt="Arc Invoice"
            width={180}
            height={44}
            className="h-11 w-auto"
            priority
          />
        </Link>

        {/* Nav links — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-[15px] font-medium font-[family-name:var(--font-display)] text-[#2128BD] hover:text-[#005FFE] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link href="/dashboard">
          <Button
            className="rounded-[26px] px-6 text-[#005FFE] border border-[#005FFE] bg-transparent hover:!bg-[#FF5C00] hover:!text-white hover:!border-[#FF5C00] transition-all duration-300 font-[family-name:var(--font-display)] font-semibold text-[15px] hover:scale-105 hover:shadow-lg hover:!shadow-[#FF5C00]/30 active:scale-95"
          >
            <span className="wk-pill-text">
              <span data-text="Launch App">Launch App</span>
            </span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
