'use client';

import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { YIELD_ESCROW_ABI } from '@/lib/contracts/abis/yield-escrow-abi';

export function useReleaseYieldEscrow() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({ hash });

  const releaseEscrow = (escrowAddress: `0x${string}`) => {
    writeContract({
      address: escrowAddress,
      abi: YIELD_ESCROW_ABI,
      functionName: 'release',
    });
  };

  return {
    releaseEscrow,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
