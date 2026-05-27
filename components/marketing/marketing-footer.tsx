import Image from 'next/image';

/**
 * MarketingFooter — simple dark-indigo footer with logo and copyright.
 * Uses brightness-0 invert to render the logo white on the dark background.
 */
export function MarketingFooter() {
  return (
    <footer
      className="w-full py-12"
      style={{ backgroundColor: '#1a1f8f' }}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo — inverted to white for dark background */}
        <Image
          src="/logo-new.png"
          alt="Arc Invoice"
          width={160}
          height={40}
          className="h-10 w-auto brightness-0 invert"
        />

        {/* Copyright */}
        <p
          className="text-center md:text-right"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}
        >
          © 2026 Arc Invoice. Built on Circle&apos;s Arc blockchain.
        </p>
      </div>
    </footer>
  );
}
