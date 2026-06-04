-- Migration to add waktu_berakhir to public.prakiraan_images table
ALTER TABLE public.prakiraan_images
  ADD COLUMN IF NOT EXISTS waktu_berakhir timestamptz;
