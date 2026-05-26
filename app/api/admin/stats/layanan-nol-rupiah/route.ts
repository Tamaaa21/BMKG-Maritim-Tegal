import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn("Supabase env vars not set: returning count 0");
      return NextResponse.json({ count: 0 });
    }

    const supabase = createClient(url, key);

    const { count } = await supabase
      .from("layanan_nol_rupiah")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ count: 0 });
  }
}
