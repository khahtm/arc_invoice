import { MarketingHeader } from '@/components/marketing/marketing-header';
import { HeroSection } from '@/components/marketing/hero-section';
import { BenefitsMarquee } from '@/components/marketing/benefits-marquee';
import { FeeEnvelopeSection } from '@/components/marketing/fee-envelope-section';
import { FeaturesSection } from '@/components/marketing/features-section';
import { HowItWorksSection } from '@/components/marketing/how-it-works-section';
import { PricingSection } from '@/components/marketing/pricing-section';
import { CtaSection } from '@/components/marketing/cta-section';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { UsdcCursor } from '@/components/marketing/usdc-cursor';
import { ChainBubblesOverlay } from '@/components/marketing/chain-bubbles-overlay';

export default function HomePage() {
  return (
    <div className="marketing-page min-h-screen bg-white overflow-x-hidden">
      <UsdcCursor />
      <ChainBubblesOverlay />
      <MarketingHeader />
      <HeroSection />
      <BenefitsMarquee />
      <FeeEnvelopeSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CtaSection />
      <MarketingFooter />
    </div>
  );
}
