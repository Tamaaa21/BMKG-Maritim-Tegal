-- Migration to add next_forecast columns to public.prakiraan_images table
-- Allows each card to have both current and next scheduled forecast

ALTER TABLE public.prakiraan_images
  ADD COLUMN IF NOT EXISTS next_url text,
  ADD COLUMN IF NOT EXISTS next_explanation text,
  ADD COLUMN IF NOT EXISTS next_waktu_mulai timestamptz,
  ADD COLUMN IF NOT EXISTS next_waktu_berakhir timestamptz;
