-- Migration: Add aktivitas column to login_logs

ALTER TABLE public.login_logs
  ADD COLUMN IF NOT EXISTS aktivitas text DEFAULT 'login';
