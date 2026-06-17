import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ok, serverError } from "@/lib/response";
import type { LayananBerbayar } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("layanan_berbayar")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return ok(data as LayananBerbayar[]);
  } catch (error) {
    return serverError(error);
  }
}
