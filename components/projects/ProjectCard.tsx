'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import type { AvatarProjectSummary } from '@/lib/storage';

interface ProjectCardProps {
  project: AvatarProjectSummary;
  onRename: (name: string) => void;
  onDelete: () => void;
}

function formatUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ProjectCard({ project, onRename, onDelete }: ProjectCardProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(project.name);

  function handleRenameSave() {
    const trimmed = nameDraft.trim();
    if (trimmed) onRename(trimmed);
    setRenameOpen(false);
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border transition-colors hover:border-foreground/30">
      <Link href={`/editor/${project.id}`} className="flex flex-col">
        <div className="flex aspect-square items-center justify-center bg-muted/30 p-6">
          <Image
            src={project.baseAvatarUrl}
            alt={project.name}
            width={160}
            height={160}
            className="h-auto w-full max-w-40"
          />
        </div>
        <div className="flex flex-col gap-1 p-3">
          <span className="truncate text-sm font-medium">{project.name}</span>
          <span className="text-xs text-muted-foreground">Updated {formatUpdatedAt(project.updatedAt)}</span>
        </div>
      </Link>

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <Popover
          open={renameOpen}
          onOpenChange={(open) => {
            setRenameOpen(open);
            if (open) setNameDraft(project.name);
          }}
        >
          <PopoverTrigger asChild>
            <Button size="icon-sm" variant="secondary" aria-label={`Rename ${project.name}`}>
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
            <Button size="icon-sm" variant="secondary" aria-label={`Delete ${project.name}`}>
              <Trash2 className="size-3.5" aria-hidden="true" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &ldquo;{project.name}&rdquo;?</AlertDialogTitle>
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
