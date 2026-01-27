'use client';

import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseUnits } from 'viem';
import { YIELD_ESCROW_ABI } from '@/lib/contracts/abis/yield-escrow-abi';

export function useFundYieldEscrow() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({ hash });

  const fundEscrow = (
    escrowAddress: `0x${string}`,
    invoiceAmount: number
  ) => {
    const invoiceAmountWei = parseUnits(invoiceAmount.toString(), 6);

    writeContract({
      address: escrowAddress,
      abi: YIELD_ESCROW_ABI,
      functionName: 'deposit',
      args: [invoiceAmountWei],
    });
  };

  return {
    fundEscrow,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
