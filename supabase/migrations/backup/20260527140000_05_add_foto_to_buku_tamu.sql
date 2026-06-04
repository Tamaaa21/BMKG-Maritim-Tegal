/* backup of original 05_add_foto_to_buku_tamu.sql */
-- Add foto_url column to buku_tamu
ALTER TABLE public.buku_tamu
ADD COLUMN IF NOT EXISTS foto_url text;

-- Add foto_data column (for storing base64 or file path)
ALTER TABLE public.buku_tamu
ADD COLUMN IF NOT EXISTS foto_data text;
