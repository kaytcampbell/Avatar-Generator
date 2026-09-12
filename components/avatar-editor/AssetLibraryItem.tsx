'use client';

import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { PlaceableAsset } from '@/types/asset';

interface AssetLibraryItemProps {
  asset: PlaceableAsset;
  onSelect: (asset: PlaceableAsset) => void;
  isActive?: boolean;
  /** Bulk-delete select mode — swaps the click target from "add/select" to
   * "toggle checkbox". Only ever passed for deletable (custom) assets. */
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export function AssetLibraryItem({
  asset,
  onSelect,
  isActive = false,
  selectable = false,
  selected = false,
  onToggleSelect,
}: AssetLibraryItemProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (selectable ? onToggleSelect?.() : onSelect(asset))}
        aria-label={selectable ? `Select ${asset.name}` : `Add ${asset.name}`}
        aria-pressed={selectable ? selected : isActive}
        className={cn(
          'flex w-full flex-col items-center gap-2 rounded-lg border p-3 transition-colors hover:border-foreground/30 hover:bg-muted/50',
          isActive && 'border-primary bg-primary/10 hover:border-primary',
        )}
      >
        <Image src={asset.thumbnailUrl} alt={asset.name} width={56} height={40} className="h-auto w-14" />
        <span className="text-xs text-muted-foreground">{asset.name}</span>
      </button>
      {selectable && (
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          aria-label={`Select ${asset.name}`}
          className="absolute top-1.5 left-1.5 bg-background"
        />
      )}
    </div>
  );
}
