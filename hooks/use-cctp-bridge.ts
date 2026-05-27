'use client';

import { useState, useCallback, useRef } from 'react';
import { useWriteContract, usePublicClient, useSwitchChain, useAccount } from 'wagmi';
import { type Address, type Hash } from 'viem';
import type { BridgeTransfer } from '@/lib/bridge/cctp-types';
import { bridgeUSDC } from '@/lib/bridge/cctp-bridge-service';
import { saveBridgeState, clearBridgeState, loadBridgeState } from '@/lib/bridge/cctp-recovery';

export function useCCTPBridge() {
  const [transfer, setTransfer] = useState<BridgeTransfer>({ status: 'idle', sourceChainId: 0 });
  const abortRef = useRef<AbortController | null>(null);
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const { chainId } = useAccount();
  const publicClient = usePublicClient({ chainId });

  const handleStatusChange = useCallback((t: BridgeTransfer) => {
    setTransfer(t);
    saveBridgeState(t);
  }, []);

  const bridge = useCallback(async (
    sourceChainId: number,
    amount: bigint,
    recipient: Address,
  ): Promise<BridgeTransfer> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await bridgeUSDC({
        sourceChainId,
        amount,
        recipient,
        writeContract: async ({ address, abi, functionName, args }) => {
          return writeContractAsync({
            address,
            abi: abi as never,
            functionName,
            args: args as never,
          });
        },
        waitForReceipt: async (hash: Hash) => {
          if (!publicClient) throw new Error('No public client');
          const receipt = await publicClient.waitForTransactionReceipt({ hash });
          return {
            logs: receipt.logs.map((l) => ({
              data: l.data,
              topics: [...l.topics],
            })),
          };
        },
        switchChain: async (targetChainId: number) => {
          await switchChainAsync({ chainId: targetChainId });
        },
        onStatusChange: handleStatusChange,
        signal: controller.signal,
      });

      clearBridgeState();
      return result;
    } catch (err) {
      const errorTransfer: BridgeTransfer = {
        ...transfer,
        status: 'error',
        error: err instanceof Error ? err.message : 'Bridge failed',
      };
      setTransfer(errorTransfer);
      saveBridgeState(errorTransfer);
      throw err;
    }
  }, [writeContractAsync, publicClient, switchChainAsync, handleStatusChange, transfer]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setTransfer({ status: 'idle', sourceChainId: 0 });
    clearBridgeState();
  }, []);

  const recoverableTransfer = useCallback(() => {
    return loadBridgeState();
  }, []);

  return { transfer, bridge, reset, recoverableTransfer };
}
