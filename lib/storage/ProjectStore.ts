import type { AvatarProject } from '@/types/avatar-project';

/**
 * Lighter projection for list views — deliberately excludes `layers` so
 * listing a user's projects never requires fetching every project's layer
 * rows just to render a thumbnail grid.
 */
export interface AvatarProjectSummary {
  id: string;
  name: string;
  baseAvatarUrl: string;
  updatedAt: string;
}

export interface ProjectStore {
  getProject(id: string): Promise<AvatarProject | null>;
  createProject(project: AvatarProject): Promise<AvatarProject>;
  saveProject(project: AvatarProject): Promise<AvatarProject>;
  listProjects(userId: string): Promise<AvatarProjectSummary[]>;
  deleteProject(id: string): Promise<void>;
  renameProject(id: string, name: string): Promise<void>;
}
