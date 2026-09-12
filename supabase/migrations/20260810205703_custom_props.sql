-- User-owned custom props (AI-generated from a text prompt), separate from
-- the public/curated `assets` catalog since these are mutable and
-- per-user — mirrors avatar_projects' ownership pattern exactly.

create table if not exists public.custom_props (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  asset_url text not null,
  thumbnail_url text not null,
  prompt text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists custom_props_user_id_idx on public.custom_props (user_id);

drop trigger if exists custom_props_set_updated_at on public.custom_props;
create trigger custom_props_set_updated_at
  before update on public.custom_props
  for each row execute function public.set_updated_at();

alter table public.custom_props enable row level security;

drop policy if exists "Custom props are owned by their user" on public.custom_props;
create policy "Custom props are owned by their user" on public.custom_props
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
