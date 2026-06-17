-- Add cover_url and description to publications if not exists
ALTER TABLE public.publications ADD COLUMN IF NOT EXISTS cover_url text;
ALTER TABLE public.publications ADD COLUMN IF NOT EXISTS description text;
