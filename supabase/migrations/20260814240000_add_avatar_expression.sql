-- Stores the AI-regenerated expression cache for a project: which
-- expression is currently active (null = the neutral base avatar) plus a
-- cache of previously-generated variants keyed by expression id, so
-- switching back to one already generated is instant and free.

alter table public.avatar_projects
  add column if not exists expression jsonb not null default '{"activeId":null,"variants":{}}'::jsonb;
