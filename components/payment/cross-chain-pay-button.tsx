'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits, type Address } from 'viem';
import { Button } from '@/components/ui/button';
import { BridgeStatusTracker } from './bridge-status-tracker';
import { useCCTPBridge } from '@/hooks/use-cctp-bridge';
import { useMultiChainBalance } from '@/hooks/use-multi-chain-balance';
import { getChainName } from '@/lib/chains';

interface CrossChainPayButtonProps {
  amount: number;
  recipientOnArc: Address;
  onBridgeComplete: (mintTxHash: string) => void;
  onError: (error: Error) => void;
}

export function CrossChainPayButton({
  amount,
  recipientOnArc,
  onBridgeComplete,
  onError,
}: CrossChainPayButtonProps) {
  const { address, chainId } = useAccount();
  const { transfer, bridge, reset } = useCCTPBridge();
  const { isInsufficient, isLoading: balanceLoading } = useMultiChainBalance();
  const [isBridging, setIsBridging] = useState(false);

  const insufficient = isInsufficient(amount);
  const chainName = chainId ? getChainName(chainId) : 'Unknown';

  const handleBridge = async () => {
    if (!address || !chainId) return;

    setIsBridging(true);
    try {
      const amountWei = parseUnits(amount.toString(), 6);
      const result = await bridge(chainId, amountWei, recipientOnArc);

      if (result.mintTxHash) {
        onBridgeComplete(result.mintTxHash);
      }
    } catch (err) {
      if (err instanceof Error &&
        (err.message.includes('User rejected') || err.message.includes('user rejected'))) {
        reset();
        setIsBridging(false);
        return;
      }
      onError(err instanceof Error ? err : new Error('Bridge failed'));
    } finally {
      setIsBridging(false);
    }
  };

  if (transfer.status !== 'idle' && transfer.status !== 'error') {
    return (
      <BridgeStatusTracker
        transfer={transfer}
        onRetry={handleBridge}
      />
    );
  }

  return (
    <div className="space-y-2">
      {transfer.status === 'error' && (
        <BridgeStatusTracker
          transfer={transfer}
          onRetry={handleBridge}
        />
      )}

      <Button
        className="w-full"
        onClick={handleBridge}
        disabled={!address || insufficient || balanceLoading || isBridging}
      >
        {!address
          ? 'Connect wallet to pay'
          : balanceLoading
            ? 'Loading balance...'
            : insufficient
              ? 'Insufficient USDC balance'
              : isBridging
                ? 'Bridging...'
                : `Pay $${amount.toFixed(2)} from ${chainName}`}
      </Button>
    </div>
  );
}
