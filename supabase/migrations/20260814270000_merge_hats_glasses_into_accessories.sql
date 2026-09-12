-- Merges the 'hats' and 'glasses' categories into 'accessories', matching
-- lib/assets/placeholder-assets.ts. Recategorizes any existing rows (real
-- user-uploaded custom props included) before tightening the check
-- constraint, so no row is left violating it.

update public.custom_props
set category = 'accessories'
where category in ('hats', 'glasses');

update public.assets
set category = 'accessories'
where category in ('hats', 'glasses');

alter table public.assets drop constraint if exists assets_category_check;
alter table public.assets add constraint assets_category_check
  check (category in ('accessories', 'food-drink', 'effects', 'backgrounds'));
