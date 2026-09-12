import type { AvatarProject } from '@/types/avatar-project';
import type { AvatarProjectSummary, ProjectStore } from './ProjectStore';

const KEY_PREFIX = 'dd-avatar-gen:project:';

/**
 * localStorage-backed stand-in for Supabase persistence. Chosen over an
 * in-memory singleton because /create -> /editor/[projectId] is a real
 * navigation boundary that must survive a hard refresh or a direct URL open.
 */
export class LocalProjectStore implements ProjectStore {
  async getProject(id: string): Promise<AvatarProject | null> {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(KEY_PREFIX + id);
    if (!raw) return null;
    return JSON.parse(raw) as AvatarProject;
  }

  async createProject(project: AvatarProject): Promise<AvatarProject> {
    if (typeof window === 'undefined') return project;
    window.localStorage.setItem(KEY_PREFIX + project.id, JSON.stringify(project));
    return project;
  }

  async saveProject(project: AvatarProject): Promise<AvatarProject> {
    if (typeof window === 'undefined') return project;
    const persisted: AvatarProject = { ...project, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(KEY_PREFIX + project.id, JSON.stringify(persisted));
    return persisted;
  }

  async listProjects(userId: string): Promise<AvatarProjectSummary[]> {
    if (typeof window === 'undefined') return [];
    const summaries: AvatarProjectSummary[] = [];
    for (const key of Object.keys(window.localStorage)) {
      if (!key.startsWith(KEY_PREFIX)) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const project = JSON.parse(raw) as AvatarProject;
      if (project.userId !== userId) continue;
      summaries.push({
        id: project.id,
        name: project.name,
        baseAvatarUrl: project.baseAvatarUrl,
        updatedAt: project.updatedAt,
      });
    }
    return summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async deleteProject(id: string): Promise<void> {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(KEY_PREFIX + id);
  }

  async renameProject(id: string, name: string): Promise<void> {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(KEY_PREFIX + id);
    if (!raw) return;
    const project = JSON.parse(raw) as AvatarProject;
    const renamed: AvatarProject = { ...project, name, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(KEY_PREFIX + id, JSON.stringify(renamed));
  }
}
