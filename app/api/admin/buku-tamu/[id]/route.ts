import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { logActivity } from "@/lib/activity-log";
import { serverError } from "@/lib/response";
import type { BukuTamu } from "@/lib/types";

export const runtime = "nodejs";

export async function DELETE(request: Request, context: any) {
  const params = (context && context.params) ? context.params : (context && typeof context === 'object' ? (context as any) : null);
  const id = params && params.id ? params.id : (typeof params?.then === 'function' ? (await params).id : undefined);
  const paramsId = id;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("buku_tamu")
      .delete()
      .eq("id", paramsId)
      .select();

    if (error) throw error;

    logActivity(request.headers.get("x-auth-user-id"), `Menghapus data buku tamu`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
