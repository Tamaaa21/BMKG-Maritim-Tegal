-- Add explanation column to prakiraan_images
ALTER TABLE public.prakiraan_images
  ADD COLUMN IF NOT EXISTS explanation text;
