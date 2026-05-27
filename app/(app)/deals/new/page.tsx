'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDeployDealEscrow } from '@/hooks/useDeployDealEscrow';
import { DealForm } from '@/components/deal/DealForm';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { DealFormData } from '@/lib/validation';

type Step = 'form' | 'deploying' | 'saving';

export default function NewDealPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('form');

  const initialValues = useMemo(() => {
    if (searchParams.get('from') !== 'proposal') return undefined;
    try {
      const raw = sessionStorage.getItem('proposal-deal');
      if (!raw) return undefined;
      sessionStorage.removeItem('proposal-deal');
      return JSON.parse(raw) as { description: string; milestones: { description: string; amount: number }[] };
    } catch { return undefined; }
  }, [searchParams]);
  const [formData, setFormData] = useState<DealFormData | null>(null);
  const pendingDealId = useRef<string | null>(null);
  const {
    deploy,
    isPending,
    isConfirming,
    isSuccess,
    escrowAddress,
    error: deployError,
  } = useDeployDealEscrow();

  const handleSubmit = async (data: DealFormData) => {
    setFormData(data);
    setStep('deploying');

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const text = await res.text();
      let result;
      try { result = JSON.parse(text); } catch { throw new Error(`Server error: ${text.slice(0, 200)}`); }
      if (!res.ok) throw new Error(result.error || 'Failed to create deal');

      pendingDealId.current = result.deal.id;
      deploy(result.deal.id, data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create deal');
      setStep('form');
    }
  };

  // After on-chain deploy succeeds, save escrow address to DB
  useEffect(() => {
    if (!isSuccess || !escrowAddress || !pendingDealId.current) return;

    const dealId = pendingDealId.current;
    pendingDealId.current = null;
    setStep('saving');

    fetch(`/api/deals/${dealId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escrow_address: escrowAddress }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save escrow address');
        toast.success('Deal created with on-chain escrow!');
        router.push(`/deals/${dealId}`);
      })
      .catch((err) => {
        toast.error(err.message);
        // Deal exists in DB but without escrow — still navigate
        router.push(`/deals/${dealId}`);
      });
  }, [isSuccess, escrowAddress, router]);

  // Handle deploy error
  useEffect(() => {
    if (deployError) {
      toast.error('Contract deployment failed. Deal saved without escrow.');
      if (pendingDealId.current) {
        router.push(`/deals/${pendingDealId.current}`);
      } else {
        setStep('form');
      }
    }
  }, [deployError, router]);

  if (step === 'deploying' || step === 'saving') {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="flex justify-center">
          {step === 'saving' ? (
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          ) : (
            <Loader2 className="h-12 w-12 text-[#005FFE] animate-spin" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            {isPending && 'Confirm in your wallet...'}
            {isConfirming && 'Deploying escrow contract...'}
            {step === 'saving' && 'Saving deal...'}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {isPending && 'Sign the transaction to deploy your deal escrow on-chain.'}
            {isConfirming && 'Waiting for blockchain confirmation. This may take a moment.'}
            {step === 'saving' && 'Almost done — linking escrow to your deal.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Create a New Deal</h1>
        <p className="text-muted-foreground mt-1">Define milestones and share with your client for escrow-protected payments.</p>
      </div>
      <Card className="p-8">
        <DealForm onSubmit={handleSubmit} isLoading={step !== 'form'} initialValues={initialValues} />
      </Card>
    </div>
  );
}
