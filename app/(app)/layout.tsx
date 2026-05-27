'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Providers } from './providers';
import Image from 'next/image';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { ChainBubblesBackground } from '@/components/wallet/ChainBubblesBackground';
import { useSession } from '@/hooks/useSession';
import { useSIWE } from '@/hooks/useSIWE';
import { MobileNav } from '@/components/layout/MobileNav';
import { TourProvider } from '@/components/tour/tour-provider';
import { toast } from 'sonner';

// Inner component that uses wagmi hooks (must be inside Providers)
function AuthContent({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { isAuthenticated, isLoading: sessionLoading, refresh } = useSession();
  const { signIn, signOut, isLoading: siweLoading } = useSIWE();

  // Auto sign-in when wallet is connected but not authenticated
  useEffect(() => {
    if (isConnected && address && !isAuthenticated && !sessionLoading && !siweLoading) {
      signIn()
        .then(() => {
          refresh();
          toast.success('Signed in successfully');
        })
        .catch((err) => {
          toast.error(err.message || 'Sign in failed');
        });
    }
  }, [isConnected, address, isAuthenticated, sessionLoading, siweLoading, signIn, refresh]);

  // Sign out when wallet disconnects
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      signOut().then(() => refresh());
    }
  }, [isConnected, isAuthenticated, signOut, refresh]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <Image src="/logo-new.png" alt="Arc Invoice" width={200} height={48} className="h-12 w-auto" />
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-[#005FFE] animate-pulse" />
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center gap-12">
        <ChainBubblesBackground />
        <Image src="/logo-new.png" alt="Arc Invoice" width={280} height={64} className="relative z-10 h-16 w-auto" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <p className="text-foreground text-xl font-semibold">Connect your wallet to continue</p>
          <p className="text-muted-foreground text-base">Accept USDC payments from any chain</p>
        </div>
        <ConnectButton />
      </div>
    );
  }

  if (siweLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <Image src="/logo-new.png" alt="Arc Invoice" width={200} height={48} className="h-12 w-auto" />
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-[#005FFE] animate-pulse" />
          <p className="text-muted-foreground font-medium">Signing in...</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Please sign the message in your wallet
        </p>
      </div>
    );
  }

  return (
    <TourProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <MobileNav>{children}</MobileNav>
      </div>
    </TourProvider>
  );
}

// Main layout wraps everything in Providers
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AuthContent>{children}</AuthContent>
    </Providers>
  );
}
