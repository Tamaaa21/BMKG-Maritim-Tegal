import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { logActivity } from "@/lib/activity-log";
import { ok, badRequest, notFound, serverError } from "@/lib/response";
import type { PrakiraanImage } from "@/lib/types";

export const runtime = "nodejs";

const ALLOWED_FIELDS = [
  "title", "url", "explanation", "slug",
  "waktu_mulai", "waktu_berakhir",
  "next_url", "next_explanation", "next_waktu_mulai", "next_waktu_berakhir",
  "display_type", "gallery_images", "category_id", "prioritas", "is_active",
  "uploader",
];

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return badRequest("Invalid id");

    const supabase: any = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("prakiraan_images")
      .select(`*, category:category_id(*)`)
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return notFound();
    return ok(data as PrakiraanImage);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return badRequest("Invalid id");

    const supabase: any = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("prakiraan_images")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return notFound();
    logActivity(req.headers.get("x-auth-user-id"), `Menghapus prakiraan: ${data?.title || id}`, req.headers.get("x-auth-user-username"));
    return ok(data as PrakiraanImage);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return badRequest("Invalid id");

    const body = await req.json();
    const supabase: any = getSupabaseAdmin();

    const cleanData: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) cleanData[key] = body[key];
    }

    if (Object.keys(cleanData).length === 0) {
      return badRequest("Tidak ada field yang valid untuk diupdate");
    }

    const { data, error } = await supabase
      .from("prakiraan_images")
      .update(cleanData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return notFound();
    logActivity(req.headers.get("x-auth-user-id"), `Mengubah prakiraan: ${data?.title || id}`, req.headers.get("x-auth-user-username"));
    return ok(data as PrakiraanImage);
  } catch (error) {
    return serverError(error);
  }
}
