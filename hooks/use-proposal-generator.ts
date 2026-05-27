'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ProposalResponse } from '@/lib/ai/types';

interface UseProposalGeneratorReturn {
  generate: (jobDescription: string) => Promise<void>;
  isGenerating: boolean;
  streamedText: string;
  result: ProposalResponse | null;
  error: string | null;
  reset: () => void;
}

export function useProposalGenerator(): UseProposalGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [result, setResult] = useState<ProposalResponse | null>(null);
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

  const generate = useCallback(async (jobDescription: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStreamedText('');
    setResult(null);
    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/proposal-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate proposal');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              fullText += content;
              setStreamedText(fullText);
            } catch { /* partial chunk */ }
          }
        }
      }

      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse AI response');

      const parsed = JSON.parse(jsonMatch[0]) as ProposalResponse;
      if (!parsed.proposal || !Array.isArray(parsed.milestones) || parsed.milestones.length === 0) {
        throw new Error('AI returned incomplete proposal');
      }
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
