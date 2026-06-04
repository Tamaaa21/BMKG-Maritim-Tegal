-- backup of original 04_add_uploader_to_prakiraan.sql
-- Add uploader column to prakiraan_images
ALTER TABLE public.prakiraan_images
  ADD COLUMN IF NOT EXISTS uploader text;
