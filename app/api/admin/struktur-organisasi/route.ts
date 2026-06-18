import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { logActivity } from "@/lib/activity-log";
import { strukturOrganisasiSchema } from "@/lib/validation";
import { ok, badRequest, serverError } from "@/lib/response";
import type { StrukturOrganisasi } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase: any = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("struktur_organisasi")
      .select("*")
      .order("urutan", { ascending: true });

    if (error) throw error;
    return ok(data as StrukturOrganisasi[]);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = strukturOrganisasiSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map(e => e.message).join(", "));
    }

    const supabase: any = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("struktur_organisasi")
      .insert({
        jabatan: parsed.data.jabatan,
        nama: parsed.data.nama || "",
        inisial: parsed.data.inisial || null,
        deskripsi: parsed.data.deskripsi || null,
        urutan: typeof parsed.data.urutan === "number" ? parsed.data.urutan : 0,
      })
      .select()
      .single();

    if (error) throw error;
    logActivity(req.headers.get("x-auth-user-id"), `Menambah struktur organisasi: ${parsed.data.jabatan}`, req.headers.get("x-auth-user-username"));
    return ok(data as StrukturOrganisasi);
  } catch (error) {
    return serverError(error);
  }
}
