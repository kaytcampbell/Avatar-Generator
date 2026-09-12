'use client';

import { useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePropUpload } from '@/hooks/usePropUpload';
import { validatePhotoFile } from '@/lib/validate-photo';
import type { AssetCategory } from '@/types/asset';
import type { CustomProp } from '@/types/custom-prop';

function nameFromFilename(filename: string): string {
  const withoutExtension = filename.replace(/\.[^/.]+$/, '');
  const spaced = withoutExtension.replace(/[-_]+/g, ' ').trim();
  if (!spaced) return 'Uploaded prop';
  return spaced.replace(/\w\S*/g, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase());
}

interface CategoryUploadButtonProps {
  category: AssetCategory;
  userId: string;
  onUploaded: (prop: CustomProp) => void;
}

export function CategoryUploadButton({ category, userId, onUploaded }: CategoryUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { status, error: uploadError, upload } = usePropUpload();

  async function handleFileSelected(file: File) {
    const validation = validatePhotoFile(file);
    if (validation) {
      setValidationError(validation);
      return;
    }
    setValidationError(null);
    const result = await upload(file);
    if (!result) return;
    const now = new Date().toISOString();
    onUploaded({
      id: crypto.randomUUID(),
      userId,
      name: nameFromFilename(file.name),
      assetUrl: result.url,
      thumbnailUrl: result.url,
      prompt: '',
      category,
      createdAt: now,
      updatedAt: now,
    });
  }

  const error = validationError ?? uploadError;

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-label="Upload prop"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelected(file);
          e.target.value = '';
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => inputRef.current?.click()}
        disabled={status === 'uploading'}
      >
        {status === 'uploading' ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Upload className="size-3.5" aria-hidden="true" />
        )}
        Upload prop
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
