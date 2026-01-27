'use client';

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from 'wagmi';
import { parseUnits, keccak256, toBytes } from 'viem';
import { YIELD_FACTORY_ABI } from '@/lib/contracts/abis/yield-factory-abi';
import { getYieldFactory } from '@/lib/contracts/addresses';

export function useCreateYieldEscrow() {
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({ hash });

  const createEscrow = (
    invoiceId: string,
    amount: number,
    autoReleaseDays: number
  ) => {
    const invoiceIdHash = keccak256(toBytes(invoiceId));
    const amountWei = parseUnits(amount.toString(), 6);

    writeContract({
      address: getYieldFactory(chainId),
      abi: YIELD_FACTORY_ABI,
      functionName: 'createEscrow',
      args: [invoiceIdHash, amountWei, BigInt(autoReleaseDays)],
    });
  };

  // Parse escrow address from receipt logs
  const getEscrowAddress = (): string | null => {
    if (!receipt?.logs) return null;

    // YieldFactory event: EscrowCreated(bytes32 indexed invoiceId, address indexed escrow, address indexed creator, uint256 amount, uint256 autoReleaseDays)
    const eventSignature = keccak256(
      toBytes('EscrowCreated(bytes32,address,address,uint256,uint256)')
    );

    for (const log of receipt.logs) {
      if (log.topics[0] === eventSignature && log.topics[2]) {
        // topic[2] is indexed escrow address
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
