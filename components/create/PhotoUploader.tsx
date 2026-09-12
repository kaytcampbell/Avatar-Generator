'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ACCEPTED_PHOTO_TYPES } from '@/lib/constants';

interface PhotoUploaderProps {
  previewUrl: string | null;
  error: string | null;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
}

export function PhotoUploader({ previewUrl, error, onFileSelected, onRemove }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_PHOTO_TYPES.join(',')}
        className="hidden"
        aria-label="Upload photo"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = '';
        }}
      />

      {previewUrl ? (
        <div className="relative flex flex-col items-center gap-3">
          <div className="relative size-56 overflow-hidden rounded-xl border">
            <Image src={previewUrl} alt="Uploaded photo preview" fill className="object-cover" unoptimized />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
              Replace
            </Button>
            <Button type="button" variant="ghost" onClick={onRemove}>
              <X className="size-4" aria-hidden="true" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-12 text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
        >
          <Upload className="size-8" aria-hidden="true" />
          <span className="text-sm font-medium">Upload a photo</span>
          <span className="text-xs">JPG, PNG, or WebP</span>
        </button>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
