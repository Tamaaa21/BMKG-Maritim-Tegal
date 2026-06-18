import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { LoginLog } from "@/lib/types";
import { logActivity } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, data: [] }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    let query = supabase
      .from("login_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (username) {
      query = query.eq("username", username);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json({ success: true, data: (data || []) as LoginLog[] });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, message: "Database config missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    let ids: string[] = [];
    
    // Parse JSON body if present
    try {
      const body = await request.json();
      if (body.ids && Array.isArray(body.ids)) {
        ids = body.ids;
      }
    } catch (e) {
      // Ignore if no body or invalid json
    }

    const userId = request.headers.get("x-auth-user-id");

    if (ids.length > 0) {
      // Delete specific records
      const { error } = await supabase
        .from("login_logs")
        .delete()
        .in("id", ids);
        
      if (error) throw error;
      logActivity(userId, `Menghapus ${ids.length} riwayat login`, request.headers.get("x-auth-user-username"));
      return NextResponse.json({ success: true, message: "Riwayat login yang dipilih berhasil dihapus" });
    } else {
      // Delete all records
      const { error } = await supabase
        .from("login_logs")
        .delete()
        .neq("id", "0");

      if (error) throw error;
      logActivity(userId, "Menghapus semua riwayat login", request.headers.get("x-auth-user-username"));
      return NextResponse.json({ success: true, message: "Semua riwayat login berhasil dihapus" });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
