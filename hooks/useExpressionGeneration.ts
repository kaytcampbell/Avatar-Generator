import { useCallback, useState } from 'react';
import type { GeneratedExpression } from '@/types/generation';

export type ExpressionGenerationStatus = 'idle' | 'generating' | 'success' | 'error';

export function useExpressionGeneration() {
  const [status, setStatus] = useState<ExpressionGenerationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (avatarUrl: string, expressionId: string): Promise<GeneratedExpression | null> => {
    setStatus('generating');
    setError(null);
    try {
      const res = await fetch('/api/avatar/expression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl, expressionId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Expression generation failed.');
      }
      const result = (await res.json()) as GeneratedExpression;
      setStatus('success');
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Expression generation failed.');
      setStatus('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return { status, error, generate, reset };
}
