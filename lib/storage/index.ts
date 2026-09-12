import type { ProjectStore } from './ProjectStore';
import { LocalProjectStore } from './LocalProjectStore';
import { SupabaseProjectStore } from '@/lib/supabase/SupabaseProjectStore';
import type { CustomPropStore } from './CustomPropStore';
import { LocalCustomPropStore } from './LocalCustomPropStore';
import { SupabaseCustomPropStore } from '@/lib/supabase/SupabaseCustomPropStore';

export type { ProjectStore, AvatarProjectSummary } from './ProjectStore';
export type { CustomPropStore } from './CustomPropStore';

let projectInstance: ProjectStore | null = null;
let customPropInstance: CustomPropStore | null = null;

/**
 * Single seam for swapping stores. UI code and hooks should only ever call
 * this factory, never import a concrete store directly.
 */
export function getProjectStore(): ProjectStore {
  if (!projectInstance) {
    projectInstance = process.env.NEXT_PUBLIC_SUPABASE_URL ? new SupabaseProjectStore() : new LocalProjectStore();
  }
  return projectInstance;
}

/** Same swap seam as getProjectStore(), for a user's saved custom props. */
export function getCustomPropStore(): CustomPropStore {
  if (!customPropInstance) {
    customPropInstance = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new SupabaseCustomPropStore()
      : new LocalCustomPropStore();
  }
  return customPropInstance;
}
