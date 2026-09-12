-- Adds a 'food-drink' category and recategorizes the existing food/drink
-- accessory props into it. Documentation-only: the app still reads the
-- runtime catalog from lib/assets/placeholder-assets.ts, not this table.

alter table public.assets drop constraint if exists assets_category_check;
alter table public.assets add constraint assets_category_check
  check (category in ('hats', 'glasses', 'accessories', 'food-drink', 'backgrounds'));

update public.assets
set category = 'food-drink'
where id in ('accessory-coffee-mug', 'accessory-bubble-tea', 'accessory-wine-glass', 'accessory-beer-mug');
