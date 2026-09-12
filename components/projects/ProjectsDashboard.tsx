'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAvatarProjects } from '@/hooks/useAvatarProjects';
import { ProjectCard } from './ProjectCard';

interface ProjectsDashboardProps {
  userId: string;
}

export function ProjectsDashboard({ userId }: ProjectsDashboardProps) {
  const { projects, status, error, deleteProject, renameProject } = useAvatarProjects(userId);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Avatars</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status === 'loading' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-16 text-center">
          <p className="text-muted-foreground">No avatars here yet — your creativity is waiting.</p>
          <Link href="/create" className="text-sm font-medium underline">
            Create your first avatar
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onRename={(name) => renameProject(project.id, name)}
              onDelete={() => deleteProject(project.id)}
            />
          ))}
          <Link
            href="/create"
            className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Plus className="size-6" aria-hidden="true" />
            Create New
          </Link>
        </div>
      )}
    </div>
  );
}
