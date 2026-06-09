ALTER TABLE public.prakiraan_images
  ADD COLUMN IF NOT EXISTS waktu_mulai timestamptz;
