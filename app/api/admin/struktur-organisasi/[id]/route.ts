import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { logActivity } from "@/lib/activity-log";
import { strukturOrganisasiSchema } from "@/lib/validation";
import { ok, badRequest, notFound, serverError } from "@/lib/response";
import type { StrukturOrganisasi } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = strukturOrganisasiSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map(e => e.message).join(", "));
    }

    const supabase: any = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("struktur_organisasi")
      .update({
        jabatan: parsed.data.jabatan,
        nama: parsed.data.nama || "",
        inisial: parsed.data.inisial || null,
        deskripsi: parsed.data.deskripsi || null,
        urutan: typeof parsed.data.urutan === "number" ? parsed.data.urutan : 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.message?.includes("not found") || error.code === "PGRST116") {
        return notFound();
      }
      throw error;
    }
    if (!data) return notFound();
    logActivity(req.headers.get("x-auth-user-id"), `Mengubah struktur organisasi: ${parsed.data.jabatan}`);
    return ok(data as StrukturOrganisasi);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase: any = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("struktur_organisasi")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.message?.includes("not found") || error.code === "PGRST116") {
        return notFound();
      }
      throw error;
    }
    if (!data) return notFound();
    logActivity(req.headers.get("x-auth-user-id"), `Menghapus struktur organisasi: ${data?.jabatan || id}`);
    return ok(data as StrukturOrganisasi);
  } catch (error) {
    return serverError(error);
  }
}
