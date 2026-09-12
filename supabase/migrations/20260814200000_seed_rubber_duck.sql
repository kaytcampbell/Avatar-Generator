-- Seeds the rubber duck accessory row to match the runtime catalog in
-- lib/assets/placeholder-assets.ts (same pattern as the earlier seeds).

insert into public.assets (id, name, category, asset_url, thumbnail_url)
values
  ('accessory-rubber-duck', 'Rubber Duck', 'accessories', '/assets/props/accessories/rubber-duck.svg', '/assets/props/accessories/rubber-duck.svg')
on conflict (id) do nothing;
