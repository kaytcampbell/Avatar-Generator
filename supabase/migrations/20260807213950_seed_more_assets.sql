-- Seeds glasses/accessories/backgrounds rows to match the runtime catalog
-- in lib/assets/placeholder-assets.ts (same pattern as the hats seed in
-- 0001_init_schema.sql).

insert into public.assets (id, name, category, asset_url, thumbnail_url)
values
  ('glasses-sunglasses', 'Sunglasses', 'glasses', '/assets/props/glasses/sunglasses.svg', '/assets/props/glasses/sunglasses.svg'),
  ('glasses-round', 'Round Glasses', 'glasses', '/assets/props/glasses/round-glasses.svg', '/assets/props/glasses/round-glasses.svg'),
  ('glasses-star', 'Star Glasses', 'glasses', '/assets/props/glasses/star-glasses.svg', '/assets/props/glasses/star-glasses.svg'),
  ('accessory-bowtie', 'Bowtie', 'accessories', '/assets/props/accessories/bowtie.svg', '/assets/props/accessories/bowtie.svg'),
  ('accessory-mustache', 'Mustache', 'accessories', '/assets/props/accessories/mustache.svg', '/assets/props/accessories/mustache.svg'),
  ('accessory-earrings', 'Earrings', 'accessories', '/assets/props/accessories/earrings.svg', '/assets/props/accessories/earrings.svg'),
  ('background-blush', 'Blush', 'backgrounds', '/assets/props/backgrounds/blush.svg', '/assets/props/backgrounds/blush.svg'),
  ('background-sky', 'Sky', 'backgrounds', '/assets/props/backgrounds/sky.svg', '/assets/props/backgrounds/sky.svg'),
  ('background-mint', 'Mint', 'backgrounds', '/assets/props/backgrounds/mint.svg', '/assets/props/backgrounds/mint.svg')
on conflict (id) do nothing;
