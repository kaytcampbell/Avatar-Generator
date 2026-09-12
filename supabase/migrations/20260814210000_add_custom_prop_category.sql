-- Uploaded props (as opposed to AI-generated ones) are tagged with the
-- category tab they were uploaded into, so they can be shown mixed in with
-- the built-in catalog there. Nullable: existing AI-generated rows have no
-- category and continue to show only in "All" and "My Props".

alter table public.custom_props add column if not exists category text;
