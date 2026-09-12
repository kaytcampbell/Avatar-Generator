-- The 'avatar' layer type was introduced for the avatar move/resize/reorder
-- feature (every project's layers array now always includes one), but this
-- check constraint was never updated to allow it — so every real save has
-- been failing on the avatar_layers insert ever since.

alter table public.avatar_layers drop constraint if exists avatar_layers_type_check;
alter table public.avatar_layers add constraint avatar_layers_type_check
  check (type in ('prop', 'background', 'avatar'));
