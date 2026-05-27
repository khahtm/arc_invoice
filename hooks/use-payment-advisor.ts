'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { PaymentAdvice } from '@/lib/ai/types';

interface UsePaymentAdvisorReturn {
  getAdvice: (amount: number, currentChainId: number) => Promise<void>;
  isLoading: boolean;
  advice: PaymentAdvice | null;
  error: string | null;
  dismiss: () => void;
}

export function usePaymentAdvisor(): UsePaymentAdvisorReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<PaymentAdvice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const dismiss = useCallback(() => {
    setAdvice(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const getAdvice = useCallback(async (amount: number, currentChainId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/payment-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currentChainId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to get advice');
      }

      const data = await res.json();
      setAdvice(data.advice);

      timerRef.current = setTimeout(() => setAdvice(null), 30000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { getAdvice, isLoading, advice, error, dismiss };
}
