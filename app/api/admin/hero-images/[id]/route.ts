import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { logActivity } from "@/lib/activity-log";
import { ok, badRequest, serverError } from "@/lib/response";
import type { HeroImage } from "@/lib/types";

export const runtime = "nodejs";

const ALLOWED_FIELDS = ["name", "url", "order_index", "is_active"];

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return badRequest("Invalid id");

    const supabase: any = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("hero_images")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    logActivity(req.headers.get("x-auth-user-id"), `Menghapus hero slider: ${data?.name || id}`, req.headers.get("x-auth-user-username"));
    return ok(data as HeroImage);
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
      .from("hero_images")
      .update(cleanData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    logActivity(req.headers.get("x-auth-user-id"), `Mengubah hero slider: ${data?.name || id}`, req.headers.get("x-auth-user-username"));
    return ok(data as HeroImage);
  } catch (error) {
    return serverError(error);
  }
}
