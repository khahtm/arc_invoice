'use client';

import { useEffect, useRef, useState } from 'react';
import { useDeployDealEscrow } from '@/hooks/useDeployDealEscrow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { DealWithMilestones } from '@/hooks/useDeals';
import type { DealFormData } from '@/lib/validation';

// Shown on a draft deal that has no on-chain escrow yet (e.g. initial
// deployment failed). Lets the creator retry the on-chain deploy.
export function DeployEscrowAction({
  deal,
  onDeployed,
}: {
  deal: DealWithMilestones;
  onDeployed: () => void;
}) {
  const { deploy, isPending, isConfirming, isSuccess, escrowAddress, error, reset } =
    useDeployDealEscrow();
  const [isSaving, setIsSaving] = useState(false);
  const saved = useRef(false);

  const handleDeploy = () => {
    saved.current = false;
    reset();
    const formData: DealFormData = {
      description: deal.description,
      auto_release_days: deal.auto_release_days,
      milestones: deal.milestones.map((m) => ({
        description: m.description,
        amount: m.amount,
      })),
    };
    deploy(deal.id, formData);
  };

  // Persist escrow address once on-chain deploy confirms
  useEffect(() => {
    if (!isSuccess || !escrowAddress || saved.current) return;
    saved.current = true;
    setIsSaving(true);

    fetch(`/api/deals/${deal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escrow_address: escrowAddress }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save escrow address');
        toast.success('Escrow contract deployed!');
        onDeployed();
      })
      .catch((err) => {
        saved.current = false;
        toast.error(err instanceof Error ? err.message : 'Failed to save escrow address');
      })
      .finally(() => setIsSaving(false));
  }, [isSuccess, escrowAddress, deal.id, onDeployed]);

  const busy = isPending || isConfirming || isSaving;

  return (
    <Card className="p-6 space-y-4 border-yellow-500/40 bg-yellow-500/5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold">Escrow not deployed</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This deal is saved but its on-chain escrow contract hasn&apos;t been deployed yet.
            Deploy it now to activate the deal and share it with your client.
          </p>
        </div>
      </div>

      {error && !busy && (
        <p className="text-sm text-destructive">
          Deployment failed: {error.message?.slice(0, 200) || 'Unknown error'}
        </p>
      )}

      <Button onClick={handleDeploy} disabled={busy} className="w-full" size="lg">
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending && 'Confirm in your wallet...'}
        {isConfirming && 'Deploying escrow...'}
        {isSaving && 'Saving...'}
        {!busy && (error ? 'Retry Deployment' : 'Deploy Escrow Contract')}
      </Button>
    </Card>
  );
}
