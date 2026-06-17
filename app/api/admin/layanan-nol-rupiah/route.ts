import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ok, serverError } from "@/lib/response";
import type { LayananNolRupiah } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("layanan_nol_rupiah")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return ok(data as LayananNolRupiah[]);
  } catch (error) {
    return serverError(error);
  }
}
