import { useCallback, useState } from 'react';
import type { GeneratedProp } from '@/lib/ai/PropGenerator';

export type PropGenerationStatus = 'idle' | 'generating' | 'success' | 'error';

export function usePropGeneration() {
  const [status, setStatus] = useState<PropGenerationStatus>('idle');
  const [result, setResult] = useState<GeneratedProp | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string) => {
    setStatus('generating');
    setError(null);
    try {
      const res = await fetch('/api/props/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Prop generation failed.');
      }
      const generated = (await res.json()) as GeneratedProp;
      setResult(generated);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prop generation failed.');
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, generate, reset };
}
