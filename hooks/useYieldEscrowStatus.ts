'use client';

import { useReadContract } from 'wagmi';
import { formatUnits, type Address } from 'viem';
import { YIELD_ESCROW_ABI } from '@/lib/contracts/abis/yield-escrow-abi';

// Yield escrow states: CREATED, FUNDED, RELEASED, REFUNDED
export type EscrowState = 'CREATED' | 'FUNDED' | 'RELEASED' | 'REFUNDED';

const STATE_MAP: EscrowState[] = ['CREATED', 'FUNDED', 'RELEASED', 'REFUNDED'];

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export interface YieldEscrowStatus {
  isLoading: boolean;
  refetch: () => void;
  creator: Address | null;
  payer: Address | null;
  originalAmount: string;
  depositedShares: string;
  currentValue: string;
  accruedYield: string;
  state: EscrowState | null;
  fundedAt: Date | null;
  autoReleaseDays: number;
  canAutoRelease: boolean;
}

export function useYieldEscrowStatus(
  escrowAddress?: `0x${string}`
): YieldEscrowStatus {
  // Read state with polling
  const { data: stateData, isLoading: stateLoading } = useReadContract({
    address: escrowAddress,
    abi: YIELD_ESCROW_ABI,
    functionName: 'state',
    query: {
      enabled: !!escrowAddress,
      refetchInterval: 10000,
    },
  });

  // Read current value with polling
  const { data: currentValueData } = useReadContract({
    address: escrowAddress,
    abi: YIELD_ESCROW_ABI,
    functionName: 'getCurrentValue',
    query: {
      enabled: !!escrowAddress,
      refetchInterval: 10000,
    },
  });

  // Read accrued yield with polling
  const { data: accruedYieldData } = useReadContract({
    address: escrowAddress,
    abi: YIELD_ESCROW_ABI,
    functionName: 'getAccruedYield',
    query: {
      enabled: !!escrowAddress,
      refetchInterval: 10000,
    },
  });

  // Read original USDC amount
  const { data: originalAmountData } = useReadContract({
    address: escrowAddress,
    abi: YIELD_ESCROW_ABI,
    functionName: 'originalUsdcAmount',
    query: { enabled: !!escrowAddress },
  });

  // Read deposited USYC shares
  const { data: depositedSharesData } = useReadContract({
    address: escrowAddress,
    abi: YIELD_ESCROW_ABI,
    functionName: 'depositedUsycShares',
    query: { enabled: !!escrowAddress },
  });

  // Read payer
  const { data: payerData } = useReadContract({
    address: escrowAddress,
    abi: YIELD_ESCROW_ABI,
    functionName: 'payer',
    query: { enabled: !!escrowAddress },
  });

  // Read creator
  const { data: creatorData } = useReadContract({
    address: escrowAddress,
    abi: YIELD_ESCROW_ABI,
    functionName: 'creator',
    query: { enabled: !!escrowAddress },
  });

  // Read fundedAt
  const { data: fundedAtData } = useReadContract({
    address: escrowAddress,
    abi: YIELD_ESCROW_ABI,
    functionName: 'fundedAt',
    query: { enabled: !!escrowAddress },
  });

  // Read canAutoRelease
  const { data: canAutoReleaseData, refetch } = useReadContract({
    address: escrowAddress,
    abi: YIELD_ESCROW_ABI,
    functionName: 'canAutoRelease',
    query: { enabled: !!escrowAddress },
  });

  // Read getDetails for autoReleaseDays
  const { data: detailsData } = useReadContract({
    address: escrowAddress,
    abi: YIELD_ESCROW_ABI,
    functionName: 'getDetails',
    query: { enabled: !!escrowAddress },
  });

  if (!escrowAddress) {
    return {
      isLoading: false,
      refetch,
      creator: null,
      payer: null,
      originalAmount: '0',
      depositedShares: '0',
      currentValue: '0',
      accruedYield: '0',
      state: null,
      fundedAt: null,
      autoReleaseDays: 0,
      canAutoRelease: false,
    };
  }

  const autoReleaseDays = detailsData
    ? Number((detailsData as bigint[])[6])
    : 0;

  return {
    isLoading: stateLoading,
    refetch,
    creator: creatorData ? (creatorData as Address) : null,
    payer: payerData && payerData !== ZERO_ADDRESS
      ? (payerData as Address)
      : null,
    originalAmount: originalAmountData
      ? formatUnits(originalAmountData as bigint, 6)
      : '0',
    depositedShares: depositedSharesData
      ? formatUnits(depositedSharesData as bigint, 6)
      : '0',
    currentValue: currentValueData
      ? formatUnits(currentValueData as bigint, 6)
      : '0',
    accruedYield: accruedYieldData
      ? formatUnits(accruedYieldData as bigint, 6)
      : '0',
    state: stateData !== undefined
      ? STATE_MAP[stateData as number] ?? null
      : null,
    fundedAt: fundedAtData && (fundedAtData as bigint) > BigInt(0)
      ? new Date(Number(fundedAtData as bigint) * 1000)
      : null,
    autoReleaseDays,
    canAutoRelease: canAutoReleaseData ? (canAutoReleaseData as boolean) : false,
  };
}
