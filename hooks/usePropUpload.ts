import { useCallback, useState } from 'react';

export type PropUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface PropUploadResult {
  url: string;
  width: number;
  height: number;
}

export function usePropUpload() {
  const [status, setStatus] = useState<PropUploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<PropUploadResult | null> => {
    setStatus('uploading');
    setError(null);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch('/api/props/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Upload failed.');
      }
      const result = (await res.json()) as PropUploadResult;
      setStatus('success');
      return result;
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
