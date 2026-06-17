-- Migration: Add RBAC, Display Type, and Login Logs
-- Part of plans.md implementation

-- 1) Add display_type and gallery_images to prakiraan_images
ALTER TABLE public.prakiraan_images
  ADD COLUMN IF NOT EXISTS display_type text DEFAULT 'gambar_saja'
    CHECK (display_type IN ('gambar_saja', 'gambar_teks', 'gambar_galeri'));

ALTER TABLE public.prakiraan_images
  ADD COLUMN IF NOT EXISTS gallery_images jsonb DEFAULT '[]'::jsonb;

-- 2) Create users table for RBAC
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'karyawan' CHECK (role IN ('admin', 'super_admin', 'karyawan')),
  nama text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read users basic info"
  ON public.users FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admin can manage users"
  ON public.users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
    )
  );

-- Insert default super admin (password: admin123 — already hashed)
INSERT INTO public.users (username, password, role, nama)
VALUES ('admin', '$2b$12$4fPVFBIL53s8AOnI8eyzauE4uSh5e.o6k52DFdGVdjqvc1wRYJXPG', 'super_admin', 'Administrator Utama')
ON CONFLICT (username) DO NOTHING;

-- 3) Create login_logs table
CREATE TABLE IF NOT EXISTS public.login_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  username text NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read login logs"
  ON public.login_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Insert login logs"
  ON public.login_logs FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- 4) Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON public.login_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_prakiraan_images_display_type ON public.prakiraan_images(display_type);
