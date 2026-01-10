'use client';

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from 'wagmi';
import { keccak256, toBytes, parseUnits } from 'viem';
import { TERMS_FACTORY_ABI } from '@/lib/contracts/terms-abi';
import { getContractAddress } from '@/lib/contracts/addresses';
import { hashTerms } from '@/lib/terms/hash';
import type { CreateTermsInput } from '@/types/terms';

export function useCreateTermsEscrow() {
  const chainId = useChainId();
  const {
    writeContract,
    data: hash,
    isPending,
    error,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const createEscrow = (
    invoiceId: string,
    terms: CreateTermsInput,
    totalAmount: number
  ) => {
    const invoiceIdHash = keccak256(toBytes(invoiceId));
    const termsHash = hashTerms(terms);

    // Calculate deliverable amounts in USDC (6 decimals)
    const deliverableAmounts = terms.deliverables.map((d) =>
      parseUnits(((d.percentageOfTotal / 100) * totalAmount).toFixed(6), 6)
    );

    // Hash criteria for on-chain storage
    const criteriaHashes = terms.deliverables.map((d) =>
      keccak256(toBytes(d.criteria))
    );

    // Deadline days as BigInt array
    const deadlineDays = terms.deliverables.map((d) => BigInt(d.deadlineDays));

    writeContract({
      address: getContractAddress(chainId, 'TERMS_FACTORY'),
      abi: TERMS_FACTORY_ABI,
      functionName: 'createEscrow',
      args: [
        invoiceIdHash,
        termsHash as `0x${string}`,
        deliverableAmounts,
        criteriaHashes,
        deadlineDays,
        BigInt(terms.auto_release_days ?? 14),
      ],
    });
  };

  // Parse escrow address from receipt logs
  const getEscrowAddress = (): string | null => {
    if (!receipt?.logs) return null;

    const eventSignature = keccak256(
      toBytes('EscrowCreated(bytes32,address,address,bytes32,uint256,uint256)')
    );

    for (const log of receipt.logs) {
      if (log.topics[0] === eventSignature && log.topics[2]) {
        return `0x${log.topics[2].slice(26)}`;
      }
    }
    return null;
  };

  return {
    createEscrow,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    escrowAddress: isSuccess ? getEscrowAddress() : null,
  };
}
