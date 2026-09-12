'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { GeneratedAvatar } from '@/types/generation';
import type { GenerationStatus } from '@/hooks/useAvatarGeneration';

interface GeneratedAvatarGridProps {
  status: GenerationStatus;
  avatars: GeneratedAvatar[];
  selectedId: string | null;
  onSelect: (avatar: GeneratedAvatar) => void;
}

export function GeneratedAvatarGrid({ status, avatars, selectedId, onSelect }: GeneratedAvatarGridProps) {
  if (status === 'generating') {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    );
  }

  if (status !== 'success' || avatars.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {avatars.map((avatar) => {
        const isSelected = avatar.id === selectedId;
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar)}
            aria-pressed={isSelected}
            aria-label="Select this generated avatar"
            className={cn(
              'relative aspect-square overflow-hidden rounded-xl border-2 transition-colors',
              isSelected ? 'border-primary' : 'border-transparent hover:border-foreground/20',
            )}
          >
            <Image src={avatar.url} alt="Generated avatar option" fill className="object-contain p-2" />
            {isSelected && (
              <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-4" aria-hidden="true" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
