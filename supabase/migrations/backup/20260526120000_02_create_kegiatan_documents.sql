-- backup of original 02_create_kegiatan_documents.sql
-- Create kegiatan_documents table
CREATE TABLE IF NOT EXISTS public.kegiatan_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  url text NOT NULL,
  file_path text,
  file_type text,
  event_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.kegiatan_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active kegiatan documents"
  ON public.kegiatan_documents FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Admin can manage kegiatan documents"
  ON public.kegiatan_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );
