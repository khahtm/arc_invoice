'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { X, Lightbulb } from 'lucide-react';
import { usePaymentAdvisor } from '@/hooks/use-payment-advisor';
import { isArcChain } from '@/lib/chains';

interface PaymentAdvisorBannerProps {
  amount: number;
  onSwitchChain: (chainId: number) => void;
}

export function PaymentAdvisorBanner({ amount, onSwitchChain }: PaymentAdvisorBannerProps) {
  const { chainId } = useAccount();
  const { getAdvice, isLoading, advice, dismiss } = usePaymentAdvisor();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current || !chainId || isArcChain(chainId)) return;
    hasFetched.current = true;
    getAdvice(amount, chainId);
  }, [chainId, amount, getAdvice]);

  if (isArcChain(chainId)) return null;
  if (!isLoading && !advice) return null;

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#005FFE]/15 bg-[#005FFE]/[0.03] px-3 py-2">
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!advice) return null;

  const isSameChain = advice.recommendedChainId === chainId;

  return (
    <div className="rounded-lg border border-[#005FFE]/15 bg-[#005FFE]/[0.03] px-3 py-2.5 flex items-center gap-2">
      <Lightbulb className="h-3.5 w-3.5 text-[#005FFE] shrink-0" />
      <p className="text-xs text-muted-foreground flex-1">
        {isSameChain
          ? `You're on the best chain. ${advice.reason}`
          : `Pay from ${advice.chainName} — ${advice.reason} ${advice.estimatedTime}`}
      </p>
      {!isSameChain && (
        <Button
          size="sm"
          variant="ghost"
          className="text-xs h-6 px-2 text-[#005FFE]"
          onClick={() => onSwitchChain(advice.recommendedChainId)}
        >
          Switch
        </Button>
      )}
      <button onClick={dismiss} className="text-muted-foreground hover:text-foreground">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
