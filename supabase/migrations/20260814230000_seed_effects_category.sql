-- Adds a new 'effects' category and seeds the starter batch, matching the
-- runtime catalog in lib/assets/placeholder-assets.ts (same pattern as the
-- earlier food-drink category migration). Documentation-only: the app still
-- reads the runtime catalog from that file, not this table.

alter table public.assets drop constraint if exists assets_category_check;
alter table public.assets add constraint assets_category_check
  check (category in ('hats', 'glasses', 'accessories', 'food-drink', 'effects', 'backgrounds'));

insert into public.assets (id, name, category, asset_url, thumbnail_url)
values
  ('effect-sparkles', 'Sparkles', 'effects', '/assets/props/effects/sparkles.svg', '/assets/props/effects/sparkles.svg'),
  ('effect-fire', 'Fire', 'effects', '/assets/props/effects/fire.svg', '/assets/props/effects/fire.svg'),
  ('effect-lightning', 'Lightning Bolt', 'effects', '/assets/props/effects/lightning.svg', '/assets/props/effects/lightning.svg'),
  ('effect-hearts', 'Hearts', 'effects', '/assets/props/effects/hearts.svg', '/assets/props/effects/hearts.svg'),
  ('effect-stars', 'Stars', 'effects', '/assets/props/effects/stars.svg', '/assets/props/effects/stars.svg'),
  ('effect-confetti', 'Confetti', 'effects', '/assets/props/effects/confetti.svg', '/assets/props/effects/confetti.svg'),
  ('effect-speed-lines', 'Speed Lines', 'effects', '/assets/props/effects/speed-lines.svg', '/assets/props/effects/speed-lines.svg'),
  ('effect-rainbow', 'Rainbow', 'effects', '/assets/props/effects/rainbow.svg', '/assets/props/effects/rainbow.svg'),
  ('effect-sweat-drop', 'Sweat Drop', 'effects', '/assets/props/effects/sweat-drop.svg', '/assets/props/effects/sweat-drop.svg'),
  ('effect-zzz', 'Zzz', 'effects', '/assets/props/effects/zzz.svg', '/assets/props/effects/zzz.svg')
on conflict (id) do nothing;
