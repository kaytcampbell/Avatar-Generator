-- Removes rows for props deleted from the runtime catalog
-- (lib/assets/placeholder-assets.ts). Documentation-only: the app still
-- reads that file at runtime, not this table.

delete from public.assets
where id in (
  'hat-cowboy',
  'hat-bucket',
  'hat-tiara',
  'hat-pirate',
  'hat-flower-crown',
  'hat-detective',
  'glasses-star',
  'accessory-scarf',
  'accessory-feather-boa',
  'accessory-pearl-necklace',
  'accessory-chunky-chain',
  'accessory-lei',
  'accessory-paintbrush',
  'accessory-magic-wand',
  'accessory-lightsaber',
  'accessory-umbrella',
  'accessory-bouquet'
);
