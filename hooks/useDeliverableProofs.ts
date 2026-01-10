'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DeliverableProof } from '@/types/terms';

export function useDeliverableProofs(invoiceId: string | null) {
  const [proofs, setProofs] = useState<DeliverableProof[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProofs = useCallback(async () => {
    if (!invoiceId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/deliverable-proofs`);
      const data = await res.json();
      setProofs(data.proofs || []);
    } catch {
      setProofs([]);
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchProofs();
  }, [fetchProofs]);

  const submitProof = async (deliverableIndex: number, proofUrl: string) => {
    if (!invoiceId) return false;

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/deliverable-proofs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliverable_index: deliverableIndex,
          proof_url: proofUrl,
        }),
      });

      if (res.ok) {
        await fetchProofs();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const getProofForDeliverable = (index: number): string | null => {
    const proof = proofs.find((p) => p.deliverable_index === index);
    return proof?.proof_url ?? null;
  };

  const hasProofForDeliverable = (index: number): boolean => {
    return proofs.some((p) => p.deliverable_index === index);
  };

  return {
    proofs,
    isLoading,
    submitProof,
    getProofForDeliverable,
    hasProofForDeliverable,
    refetch: fetchProofs,
  };
}
