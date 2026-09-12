'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { usePropGeneration } from '@/hooks/usePropGeneration';
import type { CustomPropsStatus } from '@/hooks/useCustomProps';
import { CustomPropCard } from './CustomPropCard';
import type { CustomProp } from '@/types/custom-prop';
import type { PlaceableAsset } from '@/types/asset';

const NAME_MAX_LENGTH = 40;

function nameFromPrompt(prompt: string): string {
  const trimmed = prompt.trim();
  return trimmed.length > NAME_MAX_LENGTH ? `${trimmed.slice(0, NAME_MAX_LENGTH)}…` : trimmed;
}

interface CustomPropsPanelProps {
  userId: string | null;
  customProps: CustomProp[];
  status: CustomPropsStatus;
  error: string | null;
  onAddAsset: (asset: PlaceableAsset) => void;
  onSave: (prop: CustomProp) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function CustomPropsPanel({
  userId,
  customProps,
  status,
  error,
  onAddAsset,
  onSave,
  onRename,
  onDelete,
}: CustomPropsPanelProps) {
  const [prompt, setPrompt] = useState('');
  const generation = usePropGeneration();

  if (!userId) {
    return <p className="p-4 text-sm text-muted-foreground">Sign in to generate and save your own custom props.</p>;
  }

  function handleGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed || generation.status === 'generating') return;
    generation.generate(trimmed);
  }

  function handleSave() {
    if (!generation.result) return;
    const now = new Date().toISOString();
    onSave({
      id: crypto.randomUUID(),
      // Non-null: this closure only exists in renders past the `!userId`
      // early return above, so userId is guaranteed set by the time it runs.
      userId: userId!,
      name: nameFromPrompt(prompt) || 'Custom prop',
      assetUrl: generation.result.url,
      thumbnailUrl: generation.result.url,
      prompt: prompt.trim(),
      createdAt: now,
      updatedAt: now,
    });
    generation.reset();
    setPrompt('');
  }

  return (
    <div className="flex flex-col gap-4 p-3">
      <div className="flex flex-col gap-2">
        <Input
          placeholder="Describe a prop, e.g. a red bow tie"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleGenerate();
          }}
          disabled={generation.status === 'generating'}
        />
        <Button size="sm" onClick={handleGenerate} disabled={!prompt.trim() || generation.status === 'generating'}>
          {generation.status === 'generating' ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="size-3.5" aria-hidden="true" />
              Generate
            </>
          )}
        </Button>
      </div>

      {generation.status === 'error' && generation.error && (
        <Alert variant="destructive">
          <AlertDescription>{generation.error}</AlertDescription>
        </Alert>
      )}

      {generation.result && (
        <div className="flex flex-col gap-2 rounded-lg border p-3">
          <div className="flex aspect-square items-center justify-center bg-muted/30 p-4">
            <Image
              src={generation.result.url}
              alt="Generated prop preview"
              width={96}
              height={96}
              className="h-auto w-24"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={handleSave}>
              Save
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={handleGenerate}>
              Regenerate
            </Button>
            <Button size="sm" variant="ghost" onClick={generation.reset}>
              Discard
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status === 'loading' ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      ) : customProps.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nothing here yet — describe something fun above and watch it appear ✨</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {customProps.map((prop) => (
            <CustomPropCard
              key={prop.id}
              prop={prop}
              onAdd={() => onAddAsset(prop)}
              onRename={(name) => onRename(prop.id, name)}
              onDelete={() => onDelete(prop.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
