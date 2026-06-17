-- Create pamflets table for display slides
CREATE TABLE IF NOT EXISTS public.pamflets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  url text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  uploader text,
  waktu_berakhir timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pamflets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read pamflets"
  ON public.pamflets FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admin can manage pamflets"
  ON public.pamflets FOR ALL
  TO authenticated
  USING (true);

-- Create publications table
CREATE TABLE IF NOT EXISTS public.publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  url text NOT NULL,
  file_path text,
  uploader text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read publications"
  ON public.publications FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admin can manage publications"
  ON public.publications FOR ALL
  TO authenticated
  USING (true);
