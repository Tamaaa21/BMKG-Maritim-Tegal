import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, active: 0, inactive: 0 }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const now = new Date().toISOString();

    // Active: waktu_mulai <= now AND (waktu_berakhir >= now OR waktu_berakhir IS NULL)
    const { count: active } = await supabase
      .from("prakiraan_images")
      .select("*", { count: "exact", head: true })
      .or(`waktu_mulai.is.null,waktu_mulai.lte.${now}`)
      .or(`waktu_berakhir.is.null,waktu_berakhir.gte.${now}`);

    // Inactive/expired: waktu_berakhir < now
    const { count: inactive } = await supabase
      .from("prakiraan_images")
      .select("*", { count: "exact", head: true })
      .lt("waktu_berakhir", now);

    return NextResponse.json({
      success: true,
      active: active ?? 0,
      inactive: inactive ?? 0,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, active: 0, inactive: 0 }, { status: 500 });
  }
}
