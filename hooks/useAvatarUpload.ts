import { useCallback, useState } from 'react';
import type { GeneratedAvatar } from '@/types/generation';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export function useAvatarUpload() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (photo: File): Promise<GeneratedAvatar | null> => {
    setStatus('uploading');
    setError(null);
    try {
      const formData = new FormData();
      formData.append('photo', photo);

      const res = await fetch('/api/avatar/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Upload failed.');
      }
      const avatar = (await res.json()) as GeneratedAvatar;
      setStatus('success');
      return avatar;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
      setStatus('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return { status, error, upload, reset };
}
