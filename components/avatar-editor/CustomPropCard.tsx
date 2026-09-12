'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { CustomProp } from '@/types/custom-prop';

interface CustomPropCardProps {
  prop: CustomProp;
  onAdd: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  /** Bulk-delete select mode — swaps the click target from "add to canvas" to
   * "toggle checkbox" and hides the rename/delete hover controls. */
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export function CustomPropCard({
  prop,
  onAdd,
  onRename,
  onDelete,
  selectable = false,
  selected = false,
  onToggleSelect,
}: CustomPropCardProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(prop.name);

  function handleRenameSave() {
    const trimmed = nameDraft.trim();
    if (trimmed) onRename(trimmed);
    setRenameOpen(false);
  }

  return (
    <div className="group relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors hover:border-foreground/30 hover:bg-muted/50">
      <button
        type="button"
        onClick={selectable ? onToggleSelect : onAdd}
        aria-label={selectable ? `Select ${prop.name}` : `Add ${prop.name}`}
        aria-pressed={selectable ? selected : undefined}
        className="flex w-full flex-col items-center gap-2"
      >
        <Image src={prop.thumbnailUrl} alt={prop.name} width={56} height={40} className="h-auto w-14" />
        <span className="w-full truncate text-center text-xs text-muted-foreground">{prop.name}</span>
      </button>

      {selectable && (
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          aria-label={`Select ${prop.name}`}
          className="absolute top-1.5 left-1.5 bg-background"
        />
      )}

      <div
        className={
          selectable
            ? 'hidden'
            : 'absolute top-1 right-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100'
        }
      >
        <Popover
          open={renameOpen}
          onOpenChange={(open) => {
            setRenameOpen(open);
            if (open) setNameDraft(prop.name);
          }}
        >
          <PopoverTrigger asChild>
            <Button size="icon-sm" variant="secondary" aria-label={`Rename ${prop.name}`}>
              <Pencil className="size-3.5" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex w-56 flex-col gap-2">
            <Input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSave();
              }}
              autoFocus
            />
            <Button size="sm" onClick={handleRenameSave}>
              Save
            </Button>
          </PopoverContent>
        </Popover>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon-sm" variant="secondary" aria-label={`Delete ${prop.name}`}>
              <Trash2 className="size-3.5" aria-hidden="true" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &ldquo;{prop.name}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription>This can&rsquo;t be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
