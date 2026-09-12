import { useCallback, useState } from 'react';
import type { GeneratedAvatar } from '@/types/generation';

export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

export function useAvatarGeneration() {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [results, setResults] = useState<GeneratedAvatar[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (photo: File, style?: string) => {
    setStatus('generating');
    setError(null);
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      if (style) formData.append('style', style);

      const res = await fetch('/api/avatar/generate', { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Avatar generation failed.');
      }
      const avatars = (await res.json()) as GeneratedAvatar[];
      setResults(avatars);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Avatar generation failed.');
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResults([]);
    setError(null);
  }, []);

  return { status, results, error, generate, reset };
}
