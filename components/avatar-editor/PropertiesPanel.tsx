'use client';

import { ArrowUp, ArrowDown, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { AvatarLayer } from '@/types/avatar-project';

interface PropertiesPanelProps {
  selectedLayer: AvatarLayer | null;
  isTopmost: boolean;
  isBottommost: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}

export function PropertiesPanel({
  selectedLayer,
  isTopmost,
  isBottommost,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
}: PropertiesPanelProps) {
  if (!selectedLayer) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
        Select the avatar or a prop to see its properties.
      </div>
    );
  }

  const isAvatar = selectedLayer.type === 'avatar';

  return (
    <div key={selectedLayer.id} className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <span className="font-heading text-xs font-bold text-foreground">Layer order: {selectedLayer.zIndex}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onSendBackward} disabled={isBottommost}>
            <ArrowDown className="size-4" aria-hidden="true" />
            Send Backward
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={onBringForward} disabled={isTopmost}>
            <ArrowUp className="size-4" aria-hidden="true" />
            Bring Forward
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onDuplicate} disabled={isAvatar}>
          <Copy className="size-4" aria-hidden="true" />
          Duplicate
        </Button>
        <Button variant="destructive" size="sm" className="flex-1" onClick={onDelete} disabled={isAvatar}>
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </Button>
      </div>
    </div>
  );
}
