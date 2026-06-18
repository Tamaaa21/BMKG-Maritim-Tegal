import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { logActivity } from "@/lib/activity-log";
import type { BukuTamu } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getUserId(request: NextRequest) {
  return request.headers.get("x-auth-user-id") || "";
}

function getUsername(request: NextRequest) {
  return request.headers.get("x-auth-user-username") || "";
}

function getRole(request: NextRequest) {
  return request.headers.get("x-auth-user-role") || "";
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("buku_tamu")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json((data || []) as BukuTamu[]);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const role = getRole(request);
  if (role !== "super_admin" && role !== "admin") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const supabase = getSupabaseAdmin();
    let ids: string[] = [];

    try {
      const body = await request.json();
      if (body.ids && Array.isArray(body.ids)) {
        ids = body.ids;
      }
    } catch {
      // no body = delete all
    }

    if (ids.length > 0) {
      const { error } = await supabase.from("buku_tamu").delete().in("id", ids);
      if (error) throw error;
      logActivity(getUserId(request), `Menghapus ${ids.length} data buku tamu`, getUsername(request));
      return NextResponse.json({ success: true, message: "Data terpilih berhasil dihapus" });
    } else {
      const { error } = await supabase.from("buku_tamu").delete().neq("id", "0");
      if (error) throw error;
      logActivity(getUserId(request), "Menghapus semua data buku tamu", getUsername(request));
      return NextResponse.json({ success: true, message: "Semua data berhasil dihapus" });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
