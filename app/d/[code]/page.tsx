'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { useAccount, useSignMessage, useWriteContract, useSwitchChain } from 'wagmi';
import { Providers } from '@/app/(app)/providers';
import { isArcChain } from '@/lib/chains';
import { ClientDealView } from '@/components/deal/ClientDealView';
import { ChainBubblesBackground } from '@/components/wallet/ChainBubblesBackground';

import { ConnectButton } from '@/components/wallet/ConnectButton';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { formatUSDC } from '@/lib/utils';
import { DEAL_ESCROW_ABI } from '@/lib/contracts/deal-abi';
import Image from 'next/image';
import type { DealWithMilestones } from '@/hooks/useDeals';

function DealPageContent({ code }: { code: string }) {
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const [deal, setDeal] = useState<DealWithMilestones | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signingStep, setSigningStep] = useState<string>('');

  useEffect(() => {
    fetch(`/api/d/${code}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setDeal(data.deal);
      })
      .catch(() => setError('Failed to load deal'))
      .finally(() => setIsLoading(false));
  }, [code]);

  const handleSign = useCallback(async () => {
    if (!deal || !address) return;
    setIsSigning(true);
    try {
      // Step 1: Wallet signature to prove ownership
      setSigningStep('Sign message in wallet...');
      const message = `I agree to the terms of deal ${deal.short_code} for ${formatUSDC(deal.amount)} USDC on ArcInvoice.\n\nDeal ID: ${deal.id}\nWallet: ${address}`;
      const signature = await signMessageAsync({ message });

      // Step 2: Call signTerms() on the escrow contract (if deployed)
      if (deal.escrow_address) {
        if (!isArcChain(chainId)) {
          setSigningStep('Switching to Arc...');
          await switchChainAsync({ chainId: 5042002 });
        }
        setSigningStep('Signing terms on-chain...');
        await writeContractAsync({
          address: deal.escrow_address as `0x${string}`,
          abi: DEAL_ESCROW_ABI,
          functionName: 'signTerms',
        });
      }

      // Step 3: Update DB
      setSigningStep('Saving...');
      const res = await fetch(`/api/deals/${deal.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, signature, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDeal((prev) => prev ? { ...prev, ...data.deal, milestones: prev.milestones } : null);
      toast.success('Terms signed! You can now fund milestones.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Signing failed');
    } finally {
      setIsSigning(false);
      setSigningStep('');
    }
  }, [deal, address, chainId, signMessageAsync, writeContractAsync, switchChainAsync]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <Skeleton className="h-10 w-40 mx-auto" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <Card className="p-8">
          <h1 className="text-xl font-bold text-destructive">Deal Not Found</h1>
          <p className="text-muted-foreground mt-2">{error || 'This deal link may be invalid or expired.'}</p>
        </Card>
      </div>
    );
  }

  return <ClientDealView deal={deal} onSign={handleSign} isSigning={isSigning} signingStep={signingStep} />;
}

export default function PublicDealPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);

  return (
    <Providers>
      <div className="relative min-h-screen bg-background">
        <ChainBubblesBackground subtle />
        <div className="relative z-10">
          <header className="border-b bg-background/80 backdrop-blur-sm h-14 flex items-center justify-between px-4 md:px-6">
            <Image src="/logo-new.png" alt="ArcInvoice" width={140} height={36} className="h-8 w-auto" />
            <ConnectButton />
          </header>
          <DealPageContent code={code} />
        </div>
      </div>
    </Providers>
  );
}
