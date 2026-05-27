'use client';

import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { getCCTPConfig } from '@/lib/contracts/cctp-addresses';
import { CONTRACTS } from '@/lib/contracts/addresses';
import { isArcChain } from '@/lib/chains';

const ERC20_BALANCE_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export function useMultiChainBalance() {
  const { address, chainId } = useAccount();

  const usdcAddress = chainId
    ? isArcChain(chainId)
      ? CONTRACTS[chainId as keyof typeof CONTRACTS]?.USDC
      : getCCTPConfig(chainId)?.usdc
    : undefined;

  const { data: rawBalance, isLoading } = useReadContract({
    address: usdcAddress as `0x${string}` | undefined,
    abi: ERC20_BALANCE_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!usdcAddress,
      refetchInterval: 10_000,
    },
  });

  const balance = rawBalance ? Number(formatUnits(rawBalance as bigint, 6)) : 0;

  return {
    balance,
    rawBalance: (rawBalance as bigint) ?? BigInt(0),
    isLoading,
    chainId,
    isInsufficient: (amount: number) => balance < amount,
  };
}
