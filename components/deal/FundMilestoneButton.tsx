'use client';

import { useState, useCallback } from 'react';
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ERC20_ABI, FEE_COLLECTOR_ABI } from '@/lib/contracts/abi';
import { DEAL_ESCROW_ABI } from '@/lib/contracts/deal-abi';
import { getContractAddress, tryGetContractAddress } from '@/lib/contracts/addresses';
import { toast } from 'sonner';
import type { DealWithMilestones } from '@/hooks/useDeals';
import type { Milestone } from '@/types/database';

interface FundMilestoneButtonProps {
  milestone: Milestone;
  milestoneIndex: number;
  deal: DealWithMilestones;
  disabled?: boolean;
  onFunded?: () => void;
}

export function FundMilestoneButton({
  milestone,
  milestoneIndex,
  deal,
  disabled,
  onFunded,
}: FundMilestoneButtonProps) {
  const escrowAddress = deal.escrow_address as `0x${string}` | undefined;

  if (!escrowAddress) {
    return (
      <Button size="sm" disabled className="text-xs">
        No Escrow
      </Button>
    );
  }

  return (
    <FundButtonInner
      escrowAddress={escrowAddress}
      dealId={deal.id}
      milestoneIndex={milestoneIndex}
      amount={milestone.amount}
      disabled={disabled}
      onFunded={onFunded}
    />
  );
}

type FundStep = 'idle' | 'approving' | 'approved' | 'funding' | 'done';

function FundButtonInner({
  escrowAddress,
  dealId,
  milestoneIndex,
  amount,
  disabled,
  onFunded,
}: {
  escrowAddress: `0x${string}`;
  dealId: string;
  milestoneIndex: number;
  amount: number;
  disabled?: boolean;
  onFunded?: () => void;
}) {
  const chainId = useChainId();
  const { address } = useAccount();
  const [step, setStep] = useState<FundStep>('idle');
  const { writeContractAsync } = useWriteContract();

  const amountWei = parseUnits(amount.toString(), 6);
  const feeCollectorAddr = tryGetContractAddress(chainId, 'FEE_COLLECTOR');
  const usdcAddr = tryGetContractAddress(chainId, 'USDC');

  const { data: payerAmountWei } = useReadContract({
    address: feeCollectorAddr,
    abi: FEE_COLLECTOR_ABI,
    functionName: 'calculatePayerAmount',
    args: [amountWei],
    query: { enabled: !!feeCollectorAddr },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddr,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, escrowAddress] : undefined,
    query: { enabled: !!address && !!usdcAddr },
  });

  const needsApproval = !payerAmountWei || !allowance || allowance < payerAmountWei;

  const handleClick = useCallback(async () => {
    if (!payerAmountWei || !address || !usdcAddr) return;

    try {
      // Step 1: Approve if needed
      if (needsApproval) {
        setStep('approving');
        const approveTx = await writeContractAsync({
          address: usdcAddr,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [escrowAddress, payerAmountWei],
        });
        toast.success('USDC approved! Now funding...');
        setStep('approved');
        await refetchAllowance();
      }

      // Step 2: Fund milestone on-chain
      setStep('funding');
      const fundTxHash = await writeContractAsync({
        address: escrowAddress,
        abi: DEAL_ESCROW_ABI,
        functionName: 'fundMilestone',
        args: [BigInt(milestoneIndex)],
      });

      // Step 3: Sync to DB so freelancer sees the update
      const syncRes = await fetch(`/api/deals/${dealId}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneIndex, txHash: fundTxHash, walletAddress: address }),
      });
      if (!syncRes.ok) {
        const syncErr = await syncRes.json().catch(() => ({}));
        console.error('Fund sync failed:', syncErr);
      }

      setStep('done');
      toast.success(`Milestone #${milestoneIndex + 1} funded!`);
      onFunded?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      if (!msg.includes('rejected')) {
        toast.error(msg.length > 100 ? 'Transaction failed' : msg);
      }
      setStep('idle');
    }
  }, [payerAmountWei, address, usdcAddr, needsApproval, writeContractAsync, escrowAddress, dealId, milestoneIndex, onFunded, refetchAllowance]);

  const isLoading = step !== 'idle' && step !== 'done';

  const labels: Record<FundStep, string> = {
    idle: needsApproval ? `Approve & Fund` : 'Fund',
    approving: 'Approving USDC...',
    approved: 'Funding...',
    funding: 'Funding...',
    done: 'Funded',
  };

  return (
    <Button
      size="sm"
      onClick={handleClick}
      disabled={disabled || isLoading || step === 'done' || !payerAmountWei}
      className="text-xs"
    >
      {isLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
      {labels[step]}
    </Button>
  );
}
