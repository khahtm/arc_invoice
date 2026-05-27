'use client';

import { useState, useCallback } from 'react';
import { useWriteContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Send, DollarSign, Link2, X, ExternalLink } from 'lucide-react';
import { DEAL_ESCROW_ABI } from '@/lib/contracts/deal-abi';
import { PaymentCelebration } from './payment-celebration';
import { toast } from 'sonner';
import type { Milestone } from '@/types/database';

interface FreelancerMilestoneActionsProps {
  milestone: Milestone;
  milestoneIndex: number;
  escrowAddress: string;
  dealId: string;
  onUpdate: () => void;
}

export function FreelancerMilestoneActions({
  milestone,
  milestoneIndex,
  escrowAddress,
  dealId,
  onUpdate,
}: FreelancerMilestoneActionsProps) {
  const { writeContractAsync } = useWriteContract();
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState('');
  const [showProofInput, setShowProofInput] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const handleDeliver = useCallback(async () => {
    if (!proofUrl.trim()) {
      toast.error('Please add a proof link');
      return;
    }

    setIsLoading(true);
    setAction('Submitting on-chain...');
    try {
      await writeContractAsync({
        address: escrowAddress as `0x${string}`,
        abi: DEAL_ESCROW_ABI,
        functionName: 'submitDelivery',
        args: [BigInt(milestoneIndex)],
      });

      setAction('Saving...');
      await fetch(`/api/deals/${dealId}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneIndex, proof_url: proofUrl.trim() }),
      });

      toast.success(`Milestone #${milestoneIndex + 1} delivered!`);
      onUpdate();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed';
      if (!msg.includes('rejected')) toast.error('Delivery submission failed');
    } finally {
      setIsLoading(false);
      setAction('');
    }
  }, [writeContractAsync, escrowAddress, milestoneIndex, dealId, proofUrl, onUpdate]);

  const handleRelease = useCallback(async () => {
    setIsLoading(true);
    setAction('Releasing...');
    try {
      await writeContractAsync({
        address: escrowAddress as `0x${string}`,
        abi: DEAL_ESCROW_ABI,
        functionName: 'releaseMilestone',
        args: [BigInt(milestoneIndex)],
      });

      await fetch(`/api/deals/${dealId}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneIndex }),
      });

      setShowCelebration(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed';
      if (!msg.includes('rejected')) toast.error('Release failed');
    } finally {
      setIsLoading(false);
      setAction('');
    }
  }, [writeContractAsync, escrowAddress, milestoneIndex, dealId, onUpdate]);

  // Funded but not delivered → show proof input / deliver button
  if (milestone.status === 'funded' && !milestone.delivered) {
    if (!showProofInput) {
      return (
        <Button size="sm" onClick={() => setShowProofInput(true)} className="text-xs">
          <Send className="h-3 w-3 mr-1" />
          Deliver Work
        </Button>
      );
    }

    return (
      <div className="flex flex-col gap-2 w-full mt-2">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="url"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="Link to deliverable (GitHub, Drive, Figma...)"
            className="flex-1 text-sm bg-background border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#005FFE]/30 focus:border-[#005FFE]"
          />
          <button
            onClick={() => { setShowProofInput(false); setProofUrl(''); }}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <Button size="sm" onClick={handleDeliver} disabled={isLoading || !proofUrl.trim()} className="text-xs w-full">
          {isLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
          {action || 'Submit Delivery'}
        </Button>
      </div>
    );
  }

  // Delivered but not approved → show proof link + waiting
  if (milestone.delivered && !milestone.approved) {
    return (
      <div className="flex items-center gap-2">
        {milestone.proof_url && (
          <a
            href={milestone.proof_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Proof <ExternalLink className="h-3 w-3" />
          </a>
        )}
        <span className="text-xs text-muted-foreground">Awaiting approval</span>
      </div>
    );
  }

  // Approved but not released → show Release button
  if (milestone.approved && !milestone.released) {
    return (
      <>
        <Button size="sm" onClick={handleRelease} disabled={isLoading} className="text-xs bg-green-600 hover:bg-green-700">
          {isLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <DollarSign className="h-3 w-3 mr-1" />}
          {action || 'Claim Funds'}
        </Button>
        {showCelebration && (
          <PaymentCelebration
            amount={milestone.amount}
            milestoneDescription={milestone.description}
            onClose={() => { setShowCelebration(false); onUpdate(); }}
          />
        )}
      </>
    );
  }

  if (showCelebration) {
    return (
      <PaymentCelebration
        amount={milestone.amount}
        milestoneDescription={milestone.description}
        onClose={() => { setShowCelebration(false); onUpdate(); }}
      />
    );
  }

  return null;
}
