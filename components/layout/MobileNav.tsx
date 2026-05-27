'use client';

import { Header } from './Header';
import { TabNav } from './TabNav';
import { FloatingCreateButton } from './FloatingCreateButton';
import { NetworkWarningBanner } from '@/components/wallet/NetworkWarningBanner';
import { ChainBubblesBackground } from '@/components/wallet/ChainBubblesBackground';

interface MobileNavProps {
  children: React.ReactNode;
}

export function MobileNav({ children }: MobileNavProps) {
  return (
    <div className="relative">
      <ChainBubblesBackground subtle />
      <div className="relative z-10 flex flex-col min-h-screen">
        <NetworkWarningBanner />
        <Header />
        <TabNav />
        <main className="flex-1 p-5 md:p-8 overflow-auto pb-24 md:pb-8">
          {children}
        </main>
        <FloatingCreateButton />
      </div>
    </div>
  );
}
