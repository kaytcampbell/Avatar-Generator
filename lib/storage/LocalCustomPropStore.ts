import type { CustomProp } from '@/types/custom-prop';
import type { CustomPropStore } from './CustomPropStore';

const KEY_PREFIX = 'dd-avatar-gen:custom-prop:';

/** localStorage-backed stand-in for Supabase persistence, mirroring LocalProjectStore. */
export class LocalCustomPropStore implements CustomPropStore {
  async listCustomProps(userId: string): Promise<CustomProp[]> {
    if (typeof window === 'undefined') return [];
    const props: CustomProp[] = [];
    for (const key of Object.keys(window.localStorage)) {
      if (!key.startsWith(KEY_PREFIX)) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const prop = JSON.parse(raw) as CustomProp;
      if (prop.userId !== userId) continue;
      props.push(prop);
    }
    return props.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createCustomProp(prop: CustomProp): Promise<CustomProp> {
    if (typeof window === 'undefined') return prop;
    window.localStorage.setItem(KEY_PREFIX + prop.id, JSON.stringify(prop));
    return prop;
  }

  async renameCustomProp(id: string, name: string): Promise<void> {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(KEY_PREFIX + id);
    if (!raw) return;
    const prop = JSON.parse(raw) as CustomProp;
    const renamed: CustomProp = { ...prop, name, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(KEY_PREFIX + id, JSON.stringify(renamed));
  }

  async deleteCustomProp(id: string): Promise<void> {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(KEY_PREFIX + id);
  }
}
