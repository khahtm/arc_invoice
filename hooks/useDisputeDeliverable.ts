'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { TERMS_ESCROW_ABI } from '@/lib/contracts/terms-abi';

/**
 * Hook for disputing a deliverable on-chain (V4 contracts only)
 */
export function useDisputeDeliverable(escrowAddress: `0x${string}` | undefined) {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const disputeOnChain = (deliverableIndex: number, reason: string) => {
    if (!escrowAddress) return;

    writeContract({
      address: escrowAddress,
      abi: TERMS_ESCROW_ABI,
      functionName: 'disputeDeliverable',
      args: [BigInt(deliverableIndex), reason],
    });
  };

  return {
    disputeOnChain,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}
