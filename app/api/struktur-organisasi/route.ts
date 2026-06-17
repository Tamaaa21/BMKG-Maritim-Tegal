import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ok, serverError } from "@/lib/response";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("struktur_organisasi")
      .select("*")
      .order("urutan", { ascending: true });

    if (error) throw error;
    return ok(data || []);
  } catch (error) {
    return serverError(error);
  }
}
