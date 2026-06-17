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
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const nowISO = now.toISOString();

    const { data, error } = await supabase
      .from("prakiraan_images")
      .select("id, title, slug, waktu_mulai, waktu_berakhir")
      .lte("waktu_mulai", nowISO)
      .gte("waktu_berakhir", nowISO)
      .lte("waktu_berakhir", twentyFourHoursLater)
      .order("waktu_berakhir", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error: any) {
    console.error("Error fetching expiring prakiraan:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
