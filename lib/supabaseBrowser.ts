import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (typeof window !== "undefined" && url && key) {
  supabase = createClient(url, key);
} else {
  if (typeof window !== "undefined") {
    // warn in browser when env vars are missing
    // server-side code should create its own client with service key
    // to avoid leaking secrets.
    // This avoids creating multiple GoTrueClient instances in the browser.
    // eslint-disable-next-line no-console
    console.warn("Supabase browser client not initialized (missing NEXT_PUBLIC_SUPABASE_* env vars)");
  }
}

export default supabase;
