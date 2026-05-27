'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Invoice, Milestone } from '@/types/database';
import type { DealFormData } from '@/lib/validation';

export interface DealWithMilestones extends Invoice {
  milestones: Milestone[];
}

export function useDeals() {
  const [deals, setDeals] = useState<DealWithMilestones[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchDeals = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/deals');
      const data = await res.json();
      if (!mountedRef.current) return;
      if (res.ok) {
        setDeals(data.deals);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch {
      if (mountedRef.current) setError('Failed to fetch deals');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchDeals();
    return () => { mountedRef.current = false; };
  }, [fetchDeals]);

  const createDeal = async (data: DealFormData): Promise<DealWithMilestones> => {
    const res = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      setDeals((prev) => [result.deal, ...prev]);
      return result.deal;
    }
    throw new Error(result.error || 'Failed to create deal');
  };

  return { deals, isLoading, error, createDeal, refetch: fetchDeals };
}
