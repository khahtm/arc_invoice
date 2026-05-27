'use client';

import { useEffect } from 'react';
import { Globe, Zap, Shield, Layers, Clock, BarChart3, type LucideIcon } from 'lucide-react';
import { GlareHover } from '@/components/ui/glare-hover';

// Wickret-inspired feature cards grid for the marketing page.
// Uses IntersectionObserver to trigger .wk-reveal scroll animations (globals.css).

interface FeatureItem {
  Icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
  {
    Icon: Globe,
    title: 'Cross-Chain Payments',
    description:
      'Accept USDC from Ethereum, Base, Arbitrum, Polygon, and Optimism. Bridged automatically via CCTP.',
  },
  {
    Icon: Zap,
    title: 'Instant Pay',
    description:
      'Zero-fee direct transfers with sub-second finality on Arc. Get paid immediately.',
  },
  {
    Icon: Shield,
    title: 'Protected Pay',
    description:
      'Funds held in escrow until work is delivered. Release on approval or auto-release after deadline.',
  },
  {
    Icon: Layers,
    title: 'CCTP Bridge',
    description:
      "Circle's Cross-Chain Transfer Protocol burns and mints USDC natively. No wrapped tokens.",
  },
  {
    Icon: Clock,
    title: 'Auto-Release',
    description:
      "Automatic fund release after deadline if client doesn't respond. No more chasing payments.",
  },
  {
    Icon: BarChart3,
    title: 'Dashboard & Analytics',
    description:
      'Track revenue across chains, monitor payment status, and manage all invoices in one place.',
  },
];

// Individual feature card
function FeatureCard({ Icon, title, description, delay }: FeatureItem & { delay: number }) {
  return (
    <div className="wk-reveal" style={{ transitionDelay: `${delay}ms` }}>
      <GlareHover className="h-full" borderRadius="1rem" glareColor="0,95,254" glareOpacity={0.15}>
        <div className="group/card bg-white rounded-2xl border border-[#005FFE]/10 p-6 h-full transition-all duration-300 hover:bg-[#2128BD] hover:border-[#2128BD] hover:shadow-xl hover:shadow-[#2128BD]/20">
          <div
            className="w-12 h-12 rounded-xl bg-[#005FFE]/10 group-hover/card:bg-white/15 flex items-center justify-center mb-4 transition-colors duration-300"
            aria-hidden="true"
          >
            <Icon className="w-5 h-5 text-[#005FFE] group-hover/card:text-white transition-colors duration-300" />
          </div>
          <h3 className="font-semibold text-[#2128BD] group-hover/card:text-white mb-2 text-lg transition-colors duration-300">{title}</h3>
          <p className="text-black/70 group-hover/card:text-white/80 text-sm leading-relaxed transition-colors duration-300">{description}</p>
        </div>
      </GlareHover>
    </div>
  );
}

/**
 * FeaturesSection
 * 3-column (responsive) grid of six feature cards with scroll-reveal animations.
 * Section id="features" for in-page navigation anchor.
 */
export function FeaturesSection() {
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
    <section id="features" className="w-full bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span
            className="wk-reveal wk-pill-text uppercase tracking-wider text-[#005FFE] font-semibold mb-4 bg-[#005FFE]/10 rounded-[26px] px-5 py-2"
            style={{
              fontSize: 13,
              fontFamily: 'var(--font-display), sans-serif',
            }}
          >
            <span data-text="Features">Features</span>
          </span>

          <h2
            className="wk-reveal font-bold text-[#2128BD] leading-tight mb-4 tracking-[-0.07em]"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontFamily: 'var(--font-display), sans-serif',
              transitionDelay: '0.1s',
            }}
          >
            Everything you need to
            <br />
            get paid faster
          </h2>

          <p
            className="wk-reveal text-black max-w-xl mx-auto"
            style={{
              fontSize: 16,
              transitionDelay: '0.15s',
            }}
          >
            Cross-chain USDC payments with escrow protection, built on Circle&apos;s Arc
            blockchain.
          </p>
        </div>

        {/* Feature cards grid — 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              delay={i * 60}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
