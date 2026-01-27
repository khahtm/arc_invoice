'use client';

import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { YIELD_ESCROW_ABI } from '@/lib/contracts/abis/yield-escrow-abi';

export function useRefundYieldEscrow() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({ hash });

  const refundEscrow = (escrowAddress: `0x${string}`) => {
    writeContract({
      address: escrowAddress,
      abi: YIELD_ESCROW_ABI,
      functionName: 'refund',
    });
  };

  return {
    refundEscrow,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
