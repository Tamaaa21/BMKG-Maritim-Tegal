/*
  # Add photo support to buku_tamu table
  
  1. New Column
    - `foto_url` - URL to uploaded photo or base64 data
*/

-- Add foto_url column to buku_tamu
ALTER TABLE public.buku_tamu
ADD COLUMN IF NOT EXISTS foto_url text;

-- Add foto_data column (for storing base64 or file path)
ALTER TABLE public.buku_tamu
ADD COLUMN IF NOT EXISTS foto_data text;
