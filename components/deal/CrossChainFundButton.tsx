'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useChainId, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { Button } from '@/components/ui/button';
import { BridgeStatusTracker } from '@/components/payment/bridge-status-tracker';
import { useCCTPBridge } from '@/hooks/use-cctp-bridge';
import { useMultiChainBalance } from '@/hooks/use-multi-chain-balance';
import { getChainName, isArcChain } from '@/lib/chains';
import { ERC20_ABI, FEE_COLLECTOR_ABI } from '@/lib/contracts/abi';
import { DEAL_ESCROW_ABI } from '@/lib/contracts/deal-abi';
import { getContractAddress } from '@/lib/contracts/addresses';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { DealWithMilestones } from '@/hooks/useDeals';
import type { Milestone } from '@/types/database';

interface CrossChainFundButtonProps {
  milestone: Milestone;
  milestoneIndex: number;
  deal: DealWithMilestones;
  disabled?: boolean;
  onFunded?: () => void;
}

type FundStep = 'idle' | 'bridging' | 'approving' | 'funding' | 'syncing' | 'done';

export function CrossChainFundButton({
  milestone,
  milestoneIndex,
  deal,
  disabled,
  onFunded,
}: CrossChainFundButtonProps) {
  const { address, chainId } = useAccount();
  const arcChainId = useChainId();
  const { transfer, bridge, reset, recoverableTransfer } = useCCTPBridge();
  const { isInsufficient, isLoading: balanceLoading } = useMultiChainBalance();
  const { writeContractAsync } = useWriteContract();
  const [step, setStep] = useState<FundStep>('idle');

  // Check for recoverable bridge state on mount (user closed mid-bridge)
  useEffect(() => {
    const recovered = recoverableTransfer();
    if (recovered && recovered.status !== 'idle' && recovered.status !== 'complete') {
      setStep('bridging');
      toast.info('Found an incomplete bridge transfer. You may need to complete funding manually on Arc.');
    }
  }, [recoverableTransfer]);

  const escrowAddress = deal.escrow_address as `0x${string}` | undefined;
  const amount = milestone.amount;
  const amountWei = parseUnits(amount.toString(), 6);
  const insufficient = isInsufficient(amount);
  const chainName = chainId ? getChainName(chainId) : 'Unknown';

  // Read payerAmount from FeeCollector (on Arc) to know how much to bridge
  const { data: payerAmountWei } = useReadContract({
    address: getContractAddress(5042002, 'FEE_COLLECTOR'),
    abi: FEE_COLLECTOR_ABI,
    functionName: 'calculatePayerAmount',
    args: [amountWei],
    chainId: 5042002,
  });

  const handleFund = useCallback(async () => {
    if (!address || !chainId || !escrowAddress || !payerAmountWei) return;

    try {
      // Step 1: Bridge USDC from source chain to self on Arc
      setStep('bridging');
      const bridgeAmount = payerAmountWei;
      const result = await bridge(chainId, bridgeAmount, address);

      if (!result.mintTxHash) {
        throw new Error('Bridge did not complete');
      }

      toast.success('USDC bridged to Arc! Now funding milestone...');

      // Step 2: Approve USDC to escrow on Arc
      setStep('approving');
      await writeContractAsync({
        address: getContractAddress(5042002, 'USDC'),
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [escrowAddress, payerAmountWei],
      });

      // Step 3: Fund milestone on escrow contract
      setStep('funding');
      const fundTxHash = await writeContractAsync({
        address: escrowAddress,
        abi: DEAL_ESCROW_ABI,
        functionName: 'fundMilestone',
        args: [BigInt(milestoneIndex)],
      });

      // Step 4: Sync to DB
      setStep('syncing');
      await fetch(`/api/deals/${deal.id}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneIndex,
          txHash: fundTxHash,
          bridgeTxHash: result.mintTxHash,
          walletAddress: address,
        }),
      });

      setStep('done');
      toast.success(`Milestone #${milestoneIndex + 1} funded!`);
      onFunded?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      if (msg.includes('User rejected') || msg.includes('user rejected')) {
        reset();
        setStep('idle');
        return;
      }
      toast.error(msg.length > 100 ? 'Transaction failed' : msg);
      setStep('idle');
    }
  }, [address, chainId, escrowAddress, payerAmountWei, bridge, writeContractAsync, milestoneIndex, deal.id, onFunded, reset]);

  if (!escrowAddress) {
    return (
      <Button size="sm" disabled className="text-xs">
        No Escrow
      </Button>
    );
  }

  // Show bridge progress tracker during bridging step
  if (step === 'bridging' && transfer.status !== 'idle' && transfer.status !== 'error') {
    return <BridgeStatusTracker transfer={transfer} onRetry={handleFund} />;
  }

  const isLoading = step !== 'idle' && step !== 'done';

  const labels: Record<FundStep, string> = {
    idle: `Fund from ${chainName}`,
    bridging: 'Bridging USDC...',
    approving: 'Approving USDC...',
    funding: 'Funding milestone...',
    syncing: 'Saving...',
    done: 'Funded',
  };

  return (
    <Button
      size="sm"
      onClick={handleFund}
      disabled={disabled || isLoading || step === 'done' || insufficient || balanceLoading || !payerAmountWei}
      className="text-xs"
    >
      {isLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
      {balanceLoading ? 'Loading...' : insufficient ? 'Insufficient USDC' : labels[step]}
    </Button>
  );
}
