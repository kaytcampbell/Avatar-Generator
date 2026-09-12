'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EditableProjectNameProps {
  name: string;
  onRename: (name: string) => void;
}

export function EditableProjectName({ name, onRename }: EditableProjectNameProps) {
  const [open, setOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(name);

  function handleSave() {
    const trimmed = nameDraft.trim();
    if (trimmed) onRename(trimmed);
    setOpen(false);
  }

  return (
    <div className="group flex items-center gap-1.5">
      <h1 className="text-sm font-medium">{name}</h1>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) setNameDraft(name);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Rename ${name}`}
            className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 data-[state=open]:opacity-100"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-56 flex-col gap-2" align="start">
          <Input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
            autoFocus
          />
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
