'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DealWithMilestones } from './useDeals';

export function useDealDetail(id: string) {
  const [deal, setDeal] = useState<DealWithMilestones | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeal = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/deals/${id}`);
      const data = await res.json();
      if (res.ok) {
        setDeal(data.deal);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to load deal');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  const updateDeal = async (updates: Record<string, unknown>) => {
    const res = await fetch(`/api/deals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      setDeal((prev) => prev ? { ...prev, ...data.deal } : null);
      return data.deal;
    }
    throw new Error('Failed to update deal');
  };

  const submitDelivery = async (milestoneIndex: number, proofUrl: string) => {
    const res = await fetch(`/api/deals/${id}/deliver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestone_index: milestoneIndex, proof_url: proofUrl }),
    });
    if (res.ok) {
      await fetchDeal();
      return;
    }
    const data = await res.json();
    throw new Error(data.error || 'Failed to submit delivery');
  };

  return { deal, isLoading, error, refetch: fetchDeal, updateDeal, submitDelivery };
}
