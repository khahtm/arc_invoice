'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { TERMS_ESCROW_ABI } from '@/lib/contracts/terms-abi';

interface TermsEscrowStatus {
  creator: string;
  payer: string;
  termsHash: string;
  totalAmount: bigint;
  fundedAmount: bigint;
  releasedAmount: bigint;
  state: number; // 0=CREATED, 1=SIGNED, 2=ACTIVE, 3=COMPLETED, 4=REFUNDED
  fundedAt: bigint;
  autoReleaseDays: bigint;
  deliverableCount: bigint;
  currentDeliverable: bigint;
}

export function useTermsEscrowStatus(escrowAddress: `0x${string}` | undefined) {
  // Get main details
  const { data: details, refetch: refetchDetails } = useReadContract({
    address: escrowAddress,
    abi: TERMS_ESCROW_ABI,
    functionName: 'getDetails',
    query: { enabled: !!escrowAddress },
  });

  // Parse details
  const status: TermsEscrowStatus | null = details
    ? {
        creator: details[0] as string,
        payer: details[1] as string,
        termsHash: details[2] as string,
        totalAmount: details[3] as bigint,
        fundedAmount: details[4] as bigint,
        releasedAmount: details[5] as bigint,
        state: Number(details[6]),
        fundedAt: details[7] as bigint,
        autoReleaseDays: details[8] as bigint,
        deliverableCount: details[9] as bigint,
        currentDeliverable: details[10] as bigint,
      }
    : null;

  // Get can auto-release
  const { data: canAutoRelease } = useReadContract({
    address: escrowAddress,
    abi: TERMS_ESCROW_ABI,
    functionName: 'canAutoRelease',
    query: { enabled: !!escrowAddress },
  });

  return {
    status,
    canAutoRelease: canAutoRelease ?? false,
    isCreated: status?.state === 0,
    isSigned: status?.state === 1,
    isActive: status?.state === 2,
    isCompleted: status?.state === 3,
    isRefunded: status?.state === 4,
    currentDeliverable: status ? Number(status.currentDeliverable) : 0,
    refetch: refetchDetails,
  };
}

export function useDeliverableStatus(
  escrowAddress: `0x${string}` | undefined,
  index: number
) {
  const { data } = useReadContract({
    address: escrowAddress,
    abi: TERMS_ESCROW_ABI,
    functionName: 'getDeliverable',
    args: [BigInt(index)],
    query: { enabled: !!escrowAddress },
  });

  if (!data) return null;

  return {
    amount: data[0] as bigint,
    criteriaHash: data[1] as string,
    deadlineDays: data[2] as bigint,
    funded: data[3] as boolean,
    approved: data[4] as boolean,
    disputed: data[5] as boolean,
  };
}

export interface DeliverableOnChainStatus {
  amount: bigint;
  funded: boolean;
  approved: boolean;
  disputed: boolean;
}

// Batch fetch all deliverable statuses from contract
export function useAllDeliverableStatuses(
  escrowAddress: `0x${string}` | undefined,
  deliverableCount: number
) {
  const contracts = Array.from({ length: deliverableCount }, (_, i) => ({
    address: escrowAddress!,
    abi: TERMS_ESCROW_ABI,
    functionName: 'getDeliverable' as const,
    args: [BigInt(i)],
  }));

  const { data, refetch } = useReadContracts({
    contracts: escrowAddress ? contracts : [],
    query: { enabled: !!escrowAddress && deliverableCount > 0 },
  });

  const statuses: DeliverableOnChainStatus[] = data
    ? data.map((result) => {
        if (result.status === 'success' && result.result) {
          const r = result.result as [bigint, string, bigint, boolean, boolean, boolean];
          return {
            amount: r[0],
            funded: r[3],
            approved: r[4],
            disputed: r[5],
          };
        }
        return { amount: BigInt(0), funded: false, approved: false, disputed: false };
      })
    : [];

  return { statuses, refetch };
}
