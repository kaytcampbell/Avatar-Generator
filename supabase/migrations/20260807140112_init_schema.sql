create extension if not exists pgcrypto;

-- avatar_projects ------------------------------------------------------------

create table if not exists public.avatar_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled Avatar',
  base_avatar_url text not null,
  animation jsonb,
  canvas_settings jsonb not null default '{"width":512,"height":512,"backgroundColor":"transparent"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists avatar_projects_user_id_idx on public.avatar_projects (user_id);

-- avatar_layers ---------------------------------------------------------------

create table if not exists public.avatar_layers (
  id uuid primary key default gen_random_uuid(),
  avatar_project_id uuid not null references public.avatar_projects (id) on delete cascade,
  asset_id text not null,
  type text not null check (type in ('prop', 'background')),
  x double precision not null default 0,
  y double precision not null default 0,
  scale_x double precision not null default 1,
  scale_y double precision not null default 1,
  rotation double precision not null default 0,
  z_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists avatar_layers_project_id_idx on public.avatar_layers (avatar_project_id);

-- assets ------------------------------------------------------------------
-- Documents the schema per spec; V1 still reads the runtime catalog from
-- lib/assets/placeholder-assets.ts rather than this table (see plan notes).

create table if not exists public.assets (
  id text primary key,
  name text not null,
  category text not null check (category in ('hats', 'glasses', 'accessories', 'backgrounds')),
  asset_url text not null,
  thumbnail_url text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

insert into public.assets (id, name, category, asset_url, thumbnail_url)
values
  ('hat-cap', 'Baseball Cap', 'hats', '/assets/props/hats/cap.svg', '/assets/props/hats/cap.svg'),
  ('hat-top-hat', 'Top Hat', 'hats', '/assets/props/hats/top-hat.svg', '/assets/props/hats/top-hat.svg'),
  ('hat-beanie', 'Beanie', 'hats', '/assets/props/hats/beanie.svg', '/assets/props/hats/beanie.svg')
on conflict (id) do nothing;

-- updated_at trigger --------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists avatar_projects_set_updated_at on public.avatar_projects;
create trigger avatar_projects_set_updated_at
  before update on public.avatar_projects
  for each row execute function public.set_updated_at();

drop trigger if exists avatar_layers_set_updated_at on public.avatar_layers;
create trigger avatar_layers_set_updated_at
  before update on public.avatar_layers
  for each row execute function public.set_updated_at();

-- row level security ---------------------------------------------------------

alter table public.avatar_projects enable row level security;
alter table public.avatar_layers enable row level security;
alter table public.assets enable row level security;

drop policy if exists "Projects are owned by their user" on public.avatar_projects;
create policy "Projects are owned by their user" on public.avatar_projects
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Layers follow project ownership" on public.avatar_layers;
create policy "Layers follow project ownership" on public.avatar_layers
  for all
  using (
    exists (
      select 1 from public.avatar_projects p
      where p.id = avatar_layers.avatar_project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.avatar_projects p
      where p.id = avatar_layers.avatar_project_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Assets are publicly readable" on public.assets;
create policy "Assets are publicly readable" on public.assets
  for select
  using (true);
