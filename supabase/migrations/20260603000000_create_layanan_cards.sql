-- Create layanan_cards table
CREATE TABLE IF NOT EXISTS public.layanan_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_layanan text NOT NULL,
  deskripsi text,
  url_google_form text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.layanan_cards ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Public can read active layanan cards"
  ON public.layanan_cards FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admin can manage layanan cards"
  ON public.layanan_cards FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );
