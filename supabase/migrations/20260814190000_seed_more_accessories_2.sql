-- Seeds 24 additional accessory rows to match the runtime catalog in
-- lib/assets/placeholder-assets.ts (same pattern as the earlier hats/glasses
-- /accessories/backgrounds seeds).

insert into public.assets (id, name, category, asset_url, thumbnail_url)
values
  ('accessory-scarf', 'Scarf', 'accessories', '/assets/props/accessories/scarf.svg', '/assets/props/accessories/scarf.svg'),
  ('accessory-feather-boa', 'Feather Boa', 'accessories', '/assets/props/accessories/feather-boa.svg', '/assets/props/accessories/feather-boa.svg'),
  ('accessory-pearl-necklace', 'Pearl Necklace', 'accessories', '/assets/props/accessories/pearl-necklace.svg', '/assets/props/accessories/pearl-necklace.svg'),
  ('accessory-chunky-chain', 'Chunky Chain', 'accessories', '/assets/props/accessories/chunky-chain.svg', '/assets/props/accessories/chunky-chain.svg'),
  ('accessory-superhero-cape', 'Superhero Cape', 'accessories', '/assets/props/accessories/superhero-cape.svg', '/assets/props/accessories/superhero-cape.svg'),
  ('accessory-lei', 'Lei', 'accessories', '/assets/props/accessories/lei.svg', '/assets/props/accessories/lei.svg'),
  ('accessory-lanyard', 'Lanyard', 'accessories', '/assets/props/accessories/lanyard.svg', '/assets/props/accessories/lanyard.svg'),
  ('accessory-bandana', 'Bandana', 'accessories', '/assets/props/accessories/bandana.svg', '/assets/props/accessories/bandana.svg'),
  ('accessory-coffee-mug', 'Coffee Mug', 'accessories', '/assets/props/accessories/coffee-mug.svg', '/assets/props/accessories/coffee-mug.svg'),
  ('accessory-bubble-tea', 'Bubble Tea', 'accessories', '/assets/props/accessories/bubble-tea.svg', '/assets/props/accessories/bubble-tea.svg'),
  ('accessory-wine-glass', 'Wine Glass', 'accessories', '/assets/props/accessories/wine-glass.svg', '/assets/props/accessories/wine-glass.svg'),
  ('accessory-beer-mug', 'Beer Mug', 'accessories', '/assets/props/accessories/beer-mug.svg', '/assets/props/accessories/beer-mug.svg'),
  ('accessory-phone', 'Phone', 'accessories', '/assets/props/accessories/phone.svg', '/assets/props/accessories/phone.svg'),
  ('accessory-game-controller', 'Game Controller', 'accessories', '/assets/props/accessories/game-controller.svg', '/assets/props/accessories/game-controller.svg'),
  ('accessory-microphone', 'Microphone', 'accessories', '/assets/props/accessories/microphone.svg', '/assets/props/accessories/microphone.svg'),
  ('accessory-camera', 'Camera', 'accessories', '/assets/props/accessories/camera.svg', '/assets/props/accessories/camera.svg'),
  ('accessory-book', 'Book', 'accessories', '/assets/props/accessories/book.svg', '/assets/props/accessories/book.svg'),
  ('accessory-laptop', 'Laptop', 'accessories', '/assets/props/accessories/laptop.svg', '/assets/props/accessories/laptop.svg'),
  ('accessory-paintbrush', 'Paintbrush', 'accessories', '/assets/props/accessories/paintbrush.svg', '/assets/props/accessories/paintbrush.svg'),
  ('accessory-magic-wand', 'Magic Wand', 'accessories', '/assets/props/accessories/magic-wand.svg', '/assets/props/accessories/magic-wand.svg'),
  ('accessory-lightsaber', 'Lightsaber', 'accessories', '/assets/props/accessories/lightsaber.svg', '/assets/props/accessories/lightsaber.svg'),
  ('accessory-umbrella', 'Umbrella', 'accessories', '/assets/props/accessories/umbrella.svg', '/assets/props/accessories/umbrella.svg'),
  ('accessory-bouquet', 'Bouquet', 'accessories', '/assets/props/accessories/bouquet.svg', '/assets/props/accessories/bouquet.svg'),
  ('accessory-skateboard', 'Skateboard', 'accessories', '/assets/props/accessories/skateboard.svg', '/assets/props/accessories/skateboard.svg')
on conflict (id) do nothing;
