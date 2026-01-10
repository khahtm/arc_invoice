'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useChainGuard } from '@/hooks/useChainGuard';
import { TERMS_ESCROW_ABI } from '@/lib/contracts/terms-abi';

interface AutoReleaseButtonProps {
  escrowAddress: `0x${string}`;
  canAutoRelease: boolean;
  onSuccess?: (txHash: string) => void;
}

export function AutoReleaseButton({
  escrowAddress,
  canAutoRelease,
  onSuccess,
}: AutoReleaseButtonProps) {
  const { isWrongNetwork, switchToArc } = useChainGuard();

  const {
    writeContract,
    data: hash,
    isPending,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess && hash && onSuccess) {
      onSuccess(hash);
    }
  }, [isSuccess, hash, onSuccess]);

  const handleAutoRelease = () => {
    writeContract({
      address: escrowAddress,
      abi: TERMS_ESCROW_ABI,
      functionName: 'autoRelease',
    });
  };

  if (isWrongNetwork) {
    return (
      <Button variant="destructive" onClick={switchToArc} size="sm" className="gap-2">
        <AlertTriangle className="h-4 w-4" />
        Switch to Arc
      </Button>
    );
  }

  if (!canAutoRelease) {
    return (
      <Button disabled size="sm" variant="outline">
        Auto-release not available yet
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAutoRelease}
      disabled={isPending || isConfirming}
      size="sm"
    >
      {isPending
        ? 'Confirm...'
        : isConfirming
          ? 'Releasing...'
          : 'Auto-Release Funds'}
    </Button>
  );
}
