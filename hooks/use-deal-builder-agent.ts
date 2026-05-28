'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { DealBuilderResponse } from '@/lib/ai/types';

interface UseDealBuilderReturn {
  generate: (description: string) => Promise<void>;
  isGenerating: boolean;
  streamedText: string;
  result: DealBuilderResponse | null;
  error: string | null;
  reset: () => void;
}

function validateMilestones(parsed: DealBuilderResponse): boolean {
  if (!Array.isArray(parsed.milestones) || parsed.milestones.length === 0 || parsed.milestones.length > 20) return false;
  return parsed.milestones.every(
    (m) => typeof m.description === 'string' && m.description.length > 0 && typeof m.amount === 'number' && m.amount > 0
  );
}

export function useDealBuilderAgent(): UseDealBuilderReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [result, setResult] = useState<DealBuilderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsGenerating(false);
    setStreamedText('');
    setResult(null);
    setError(null);
  }, []);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const generate = useCallback(async (description: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStreamedText('');
    setResult(null);
    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/deal-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate milestones');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              fullText += content;
              setStreamedText(fullText);
            } catch {
              // partial JSON chunk, skip
            }
          }
        }
      }

      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse AI response');

      // Strip control characters that the LLM may embed inside JSON string values
      const sanitized = jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, (ch) => {
        if (ch === '\n') return '\\n';
        if (ch === '\r') return '\\r';
        if (ch === '\t') return '\\t';
        return '';
      });
      const parsed = JSON.parse(sanitized) as DealBuilderResponse;
      if (!validateMilestones(parsed)) throw new Error('AI returned invalid milestone data');
      setResult(parsed);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generate, isGenerating, streamedText, result, error, reset };
}
