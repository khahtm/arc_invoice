'use client';

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { TERMS_ESCROW_ABI } from '@/lib/contracts/terms-abi';
import { ERC20_ABI } from '@/lib/contracts/abi';
import { getContractAddress } from '@/lib/contracts/addresses';
import { calculateFees } from '@/hooks/useFeeCalculation';

export function useFundTermsEscrow(escrowAddress: `0x${string}` | undefined) {
  const chainId = useChainId();

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

  // Step 1: Sign terms (on-chain)
  const signTermsOnChain = (signature: `0x${string}`) => {
    if (!escrowAddress) return;

    writeContract({
      address: escrowAddress,
      abi: TERMS_ESCROW_ABI,
      functionName: 'signTerms',
      args: [signature],
    });
  };

  // Step 2: Approve USDC
  const approveUsdc = (amount: number) => {
    // Calculate payer amount (amount + fee)
    const amountInMicroUsdc = Math.round(amount * 1e6);
    const { payerAmount } = calculateFees(amountInMicroUsdc);
    const amountWei = BigInt(payerAmount);

    writeContract({
      address: getContractAddress(chainId, 'USDC'),
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [escrowAddress!, amountWei],
    });
  };

  // Step 3: Fund deliverable
  const fundDeliverable = (index: number) => {
    if (!escrowAddress) return;

    writeContract({
      address: escrowAddress,
      abi: TERMS_ESCROW_ABI,
      functionName: 'fundDeliverable',
      args: [BigInt(index)],
    });
  };

  return {
    signTermsOnChain,
    approveUsdc,
    fundDeliverable,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}
