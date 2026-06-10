-- Migration to add prioritas to public.prakiraan_images table
ALTER TABLE public.prakiraan_images
  ADD COLUMN IF NOT EXISTS prioritas integer DEFAULT 1;
