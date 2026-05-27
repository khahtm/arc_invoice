'use client';

import { useState, useCallback } from 'react';
import type { MediatorResponse } from '@/lib/ai/types';

interface UseDisputeMediatorReturn {
  analyze: (dealId: string) => Promise<void>;
  isAnalyzing: boolean;
  result: MediatorResponse | null;
  error: string | null;
  reset: () => void;
}

export function useDisputeMediator(): UseDisputeMediatorReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MediatorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsAnalyzing(false);
    setResult(null);
    setError(null);
  }, []);

  const analyze = useCallback(async (dealId: string) => {
    reset();
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/ai/dispute-mediator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to analyze dispute');
      }

      const data = await res.json();
      setResult(data.recommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsAnalyzing(false);
    }
  }, [reset]);

  return { analyze, isAnalyzing, result, error, reset };
}
