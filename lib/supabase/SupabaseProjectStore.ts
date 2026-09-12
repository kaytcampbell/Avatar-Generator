import { createClient } from '@/lib/supabase/client';
import type { AvatarProjectSummary, ProjectStore } from '@/lib/storage/ProjectStore';
import type { AvatarProject } from '@/types/avatar-project';
import { toAvatarProject, toLayerRow, toProjectRow, type AvatarLayerRow, type AvatarProjectRow } from './mappers';

/**
 * Called only from client components — RLS (auth.uid() = user_id) is what
 * keeps this safe to run in the browser with the publishable key.
 */
export class SupabaseProjectStore implements ProjectStore {
  async getProject(id: string): Promise<AvatarProject | null> {
    const supabase = createClient();

    const { data: projectRow, error: projectError } = await supabase
      .from('avatar_projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (projectError) throw new Error(projectError.message);
    if (!projectRow) return null;

    const { data: layerRows, error: layersError } = await supabase
      .from('avatar_layers')
      .select('*')
      .eq('avatar_project_id', id)
      .order('z_index', { ascending: true });

    if (layersError) throw new Error(layersError.message);

    return toAvatarProject(projectRow as AvatarProjectRow, (layerRows ?? []) as AvatarLayerRow[]);
  }

  async createProject(project: AvatarProject): Promise<AvatarProject> {
    const supabase = createClient();
    const { error } = await supabase.from('avatar_projects').insert(toProjectRow(project));
    if (error) throw new Error(error.message);
    return project;
  }

  async saveProject(project: AvatarProject): Promise<AvatarProject> {
    const supabase = createClient();
    const persisted: AvatarProject = { ...project, updatedAt: new Date().toISOString() };

    const { error: projectError } = await supabase
      .from('avatar_projects')
      .update(toProjectRow(persisted))
      .eq('id', project.id);
    if (projectError) throw new Error(projectError.message);

    const { error: deleteError } = await supabase.from('avatar_layers').delete().eq('avatar_project_id', project.id);
    if (deleteError) throw new Error(deleteError.message);

    if (persisted.layers.length > 0) {
      const { error: insertError } = await supabase
        .from('avatar_layers')
        .insert(persisted.layers.map((layer) => toLayerRow(layer, project.id)));
      if (insertError) throw new Error(insertError.message);
    }

    return persisted;
  }

  async listProjects(userId: string): Promise<AvatarProjectSummary[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('avatar_projects')
      .select('id, name, base_avatar_url, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      baseAvatarUrl: row.base_avatar_url,
      updatedAt: row.updated_at,
    }));
  }

  async deleteProject(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('avatar_projects').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  async renameProject(id: string, name: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('avatar_projects').update({ name }).eq('id', id);
    if (error) throw new Error(error.message);
  }
}
