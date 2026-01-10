'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useChainGuard } from '@/hooks/useChainGuard';
import { TERMS_ESCROW_ABI } from '@/lib/contracts/terms-abi';

interface ApproveDeliverableButtonProps {
  escrowAddress: `0x${string}`;
  deliverableIndex: number;
  onSuccess?: (txHash: string) => void;
}

export function ApproveDeliverableButton({
  escrowAddress,
  deliverableIndex,
  onSuccess,
}: ApproveDeliverableButtonProps) {
  const { isWrongNetwork, switchToArc } = useChainGuard();

  const {
    writeContract,
    data: hash,
    isPending,
    error,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess && hash && onSuccess) {
      onSuccess(hash);
    }
  }, [isSuccess, hash, onSuccess]);

  const handleApprove = () => {
    writeContract({
      address: escrowAddress,
      abi: TERMS_ESCROW_ABI,
      functionName: 'approveDeliverable',
      args: [BigInt(deliverableIndex)],
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

  return (
    <Button
      onClick={handleApprove}
      disabled={isPending || isConfirming}
      size="sm"
    >
      {isPending
        ? 'Confirm...'
        : isConfirming
          ? 'Approving...'
          : 'Approve & Release'}
    </Button>
  );
}
