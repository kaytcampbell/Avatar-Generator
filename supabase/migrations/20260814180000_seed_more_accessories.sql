-- Seeds 10 additional accessory rows to match the runtime catalog in
-- lib/assets/placeholder-assets.ts (same pattern as the earlier hats/glasses
-- /accessories/backgrounds seeds).

insert into public.assets (id, name, category, asset_url, thumbnail_url)
values
  ('accessory-devil-horns', 'Devil Horns', 'accessories', '/assets/props/accessories/devil-horns.svg', '/assets/props/accessories/devil-horns.svg'),
  ('accessory-angel-halo', 'Angel Halo', 'accessories', '/assets/props/accessories/angel-halo.svg', '/assets/props/accessories/angel-halo.svg'),
  ('accessory-cat-ears', 'Cat Ears', 'accessories', '/assets/props/accessories/cat-ears.svg', '/assets/props/accessories/cat-ears.svg'),
  ('accessory-bunny-ears', 'Bunny Ears', 'accessories', '/assets/props/accessories/bunny-ears.svg', '/assets/props/accessories/bunny-ears.svg'),
  ('accessory-bear-ears', 'Bear Ears', 'accessories', '/assets/props/accessories/bear-ears.svg', '/assets/props/accessories/bear-ears.svg'),
  ('accessory-antennae', 'Antennae', 'accessories', '/assets/props/accessories/antennae.svg', '/assets/props/accessories/antennae.svg'),
  ('accessory-unicorn-horn', 'Unicorn Horn', 'accessories', '/assets/props/accessories/unicorn-horn.svg', '/assets/props/accessories/unicorn-horn.svg'),
  ('accessory-antlers', 'Antlers', 'accessories', '/assets/props/accessories/antlers.svg', '/assets/props/accessories/antlers.svg'),
  ('accessory-headphones', 'Headphones', 'accessories', '/assets/props/accessories/headphones.svg', '/assets/props/accessories/headphones.svg'),
  ('accessory-gaming-headset', 'Gaming Headset', 'accessories', '/assets/props/accessories/gaming-headset.svg', '/assets/props/accessories/gaming-headset.svg')
on conflict (id) do nothing;
