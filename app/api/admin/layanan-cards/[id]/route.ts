import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { logActivity } from "@/lib/activity-log";
import { layananCardSchema } from "@/lib/validation";
import { ok, badRequest, serverError } from "@/lib/response";
import type { LayananCard } from "@/lib/types";

export const runtime = "nodejs";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase: any = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("layanan_cards")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    logActivity(req.headers.get("x-auth-user-id"), `Menghapus layanan: ${data?.nama_layanan || id}`, req.headers.get("x-auth-user-username"));
    return ok(data as LayananCard);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = layananCardSchema.partial().safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map(e => e.message).join(", "));
    }

    const supabase: any = getSupabaseAdmin();
    const updateObj: Record<string, unknown> = {};
    if (parsed.data.nama_layanan !== undefined) updateObj.nama_layanan = parsed.data.nama_layanan;
    if (parsed.data.deskripsi !== undefined) updateObj.deskripsi = parsed.data.deskripsi;
    if (parsed.data.url_google_form !== undefined) updateObj.url_google_form = parsed.data.url_google_form || null;
    if (parsed.data.cover_url !== undefined) updateObj.cover_url = parsed.data.cover_url || null;
    updateObj.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("layanan_cards")
      .update(updateObj)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    logActivity(req.headers.get("x-auth-user-id"), `Mengubah layanan: ${data?.nama_layanan || id}`, req.headers.get("x-auth-user-username"));
    return ok(data as LayananCard);
  } catch (error) {
    return serverError(error);
  }
}
