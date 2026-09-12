import { createClient } from '@/lib/supabase/client';
import type { CustomPropStore } from '@/lib/storage/CustomPropStore';
import type { CustomProp } from '@/types/custom-prop';

interface CustomPropRow {
  id: string;
  user_id: string;
  name: string;
  asset_url: string;
  thumbnail_url: string;
  prompt: string;
  category: string | null;
  created_at: string;
  updated_at: string;
}

function toCustomProp(row: CustomPropRow): CustomProp {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    assetUrl: row.asset_url,
    thumbnailUrl: row.thumbnail_url,
    prompt: row.prompt,
    category: (row.category as CustomProp['category']) ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toCustomPropRow(prop: CustomProp): CustomPropRow {
  return {
    id: prop.id,
    user_id: prop.userId,
    name: prop.name,
    asset_url: prop.assetUrl,
    thumbnail_url: prop.thumbnailUrl,
    prompt: prop.prompt,
    category: prop.category ?? null,
    created_at: prop.createdAt,
    updated_at: prop.updatedAt,
  };
}

/** Called only from client components — RLS (auth.uid() = user_id) is what keeps this safe with the publishable key. */
export class SupabaseCustomPropStore implements CustomPropStore {
  async listCustomProps(userId: string): Promise<CustomProp[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('custom_props')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => toCustomProp(row as CustomPropRow));
  }

  async createCustomProp(prop: CustomProp): Promise<CustomProp> {
    const supabase = createClient();
    const { error } = await supabase.from('custom_props').insert(toCustomPropRow(prop));
    if (error) throw new Error(error.message);
    return prop;
  }

  async renameCustomProp(id: string, name: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('custom_props').update({ name }).eq('id', id);
    if (error) throw new Error(error.message);
  }

  async deleteCustomProp(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('custom_props').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}
