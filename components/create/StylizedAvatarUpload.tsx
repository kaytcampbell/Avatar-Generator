'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PhotoUploader } from './PhotoUploader';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { validatePhotoFile } from '@/lib/validate-photo';
import type { GeneratedAvatar } from '@/types/generation';

interface StylizedAvatarUploadProps {
  onUploaded: (avatar: GeneratedAvatar) => void;
}

export function StylizedAvatarUpload({ onUploaded }: StylizedAvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const { status, error, upload } = useAvatarUpload();

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function handleFileSelected(file: File) {
    const validationError = validatePhotoFile(file);
    if (validationError) {
      setPhotoError(validationError);
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhotoError(null);
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleRemove() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPhotoFile(null);
    setPhotoError(null);
  }

  async function handleUseAsIs() {
    if (!photoFile) return;
    const avatar = await upload(photoFile);
    if (avatar) onUploaded(avatar);
  }

  return (
    <div className="flex flex-col gap-6">
      <PhotoUploader
        previewUrl={previewUrl}
        error={photoError}
        onFileSelected={handleFileSelected}
        onRemove={handleRemove}
      />

      {previewUrl && (
        <Button onClick={handleUseAsIs} disabled={status === 'uploading'} className="w-fit">
          {status === 'uploading' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {status === 'uploading' ? 'Uploading...' : 'Use This Avatar'}
        </Button>
      )}

      {status === 'error' && error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
