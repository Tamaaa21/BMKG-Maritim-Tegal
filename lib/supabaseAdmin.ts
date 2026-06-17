import { createClient } from "@supabase/supabase-js";

let cachedClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase URL and Service Role Key must be configured in environment variables");
  }

  cachedClient = createClient(supabaseUrl, serviceKey);
  return cachedClient;
}

export function resetSupabaseAdmin() {
  cachedClient = null;
}
