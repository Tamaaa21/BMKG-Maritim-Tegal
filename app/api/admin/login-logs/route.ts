import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, data: [] }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase
      .from("login_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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

    if (ids.length > 0) {
      // Delete specific records
      const { error } = await supabase
        .from("login_logs")
        .delete()
        .in("id", ids);
        
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Riwayat login yang dipilih berhasil dihapus" });
    } else {
      // Delete all records
      const { error } = await supabase
        .from("login_logs")
        .delete()
        .neq("id", "0");

      if (error) throw error;
      return NextResponse.json({ success: true, message: "Semua riwayat login berhasil dihapus" });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
