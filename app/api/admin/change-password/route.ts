import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ success: false, message: "Semua field harus diisi" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: "Kata sandi baru minimal 6 karakter" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, message: "Konfigurasi server tidak lengkap" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Get username from request header (sent from client)
    const usernameHeader = request.headers.get("x-admin-username");
    
    if (!usernameHeader) {
      return NextResponse.json({ success: false, message: "Sesi tidak valid, silakan login ulang" }, { status: 401 });
    }

    // Verify the old password against Supabase users table
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("id, username, password")
      .eq("username", usernameHeader)
      .single();

    if (findError || !user) {
      return NextResponse.json({ success: false, message: "Akun tidak ditemukan" }, { status: 404 });
    }

    if (user.password !== oldPassword) {
      return NextResponse.json({ success: false, message: "Kata sandi lama salah" }, { status: 400 });
    }

    // Update password in Supabase
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: newPassword })
      .eq("id", user.id);

    if (updateError) {
      console.error("Update password error:", updateError);
      return NextResponse.json({ success: false, message: "Gagal memperbarui kata sandi di database" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Kata sandi berhasil diperbarui" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}
