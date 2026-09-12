-- Seeds 15 additional hat rows to match the runtime catalog in
-- lib/assets/placeholder-assets.ts (same pattern as the earlier hats/glasses
-- /accessories/backgrounds seeds).

insert into public.assets (id, name, category, asset_url, thumbnail_url)
values
  ('hat-cowboy', 'Cowboy Hat', 'hats', '/assets/props/hats/cowboy.svg', '/assets/props/hats/cowboy.svg'),
  ('hat-bucket', 'Bucket Hat', 'hats', '/assets/props/hats/bucket.svg', '/assets/props/hats/bucket.svg'),
  ('hat-crown', 'Crown', 'hats', '/assets/props/hats/crown.svg', '/assets/props/hats/crown.svg'),
  ('hat-tiara', 'Tiara', 'hats', '/assets/props/hats/tiara.svg', '/assets/props/hats/tiara.svg'),
  ('hat-wizard', 'Wizard Hat', 'hats', '/assets/props/hats/wizard.svg', '/assets/props/hats/wizard.svg'),
  ('hat-chef', 'Chef Hat', 'hats', '/assets/props/hats/chef.svg', '/assets/props/hats/chef.svg'),
  ('hat-party', 'Party Hat', 'hats', '/assets/props/hats/party.svg', '/assets/props/hats/party.svg'),
  ('hat-viking', 'Viking Helmet', 'hats', '/assets/props/hats/viking.svg', '/assets/props/hats/viking.svg'),
  ('hat-pirate', 'Pirate Hat', 'hats', '/assets/props/hats/pirate.svg', '/assets/props/hats/pirate.svg'),
  ('hat-propeller-beanie', 'Propeller Beanie', 'hats', '/assets/props/hats/propeller-beanie.svg', '/assets/props/hats/propeller-beanie.svg'),
  ('hat-flower-crown', 'Flower Crown', 'hats', '/assets/props/hats/flower-crown.svg', '/assets/props/hats/flower-crown.svg'),
  ('hat-graduation-cap', 'Graduation Cap', 'hats', '/assets/props/hats/graduation-cap.svg', '/assets/props/hats/graduation-cap.svg'),
  ('hat-hard-hat', 'Hard Hat', 'hats', '/assets/props/hats/hard-hat.svg', '/assets/props/hats/hard-hat.svg'),
  ('hat-toque', 'Toque', 'hats', '/assets/props/hats/toque.svg', '/assets/props/hats/toque.svg'),
  ('hat-detective', 'Detective Hat', 'hats', '/assets/props/hats/detective.svg', '/assets/props/hats/detective.svg')
on conflict (id) do nothing;
