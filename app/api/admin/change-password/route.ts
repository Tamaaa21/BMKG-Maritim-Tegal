import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyPassword, hashPassword } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";
import { changePasswordSchema } from "@/lib/validation";
import { badRequest, notFound, serverError } from "@/lib/response";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map(e => e.message).join(", "));
    }

    const { currentPassword, newPassword } = parsed.data;

    const userId = request.headers.get("x-auth-user-id");
    if (!userId) {
      return NextResponse.json({ success: false, message: "Sesi tidak valid, silakan login ulang" }, { status: 401 });
    }

    const supabase: any = getSupabaseAdmin();

    const { data: user, error: findError } = await supabase
      .from("users")
      .select("id, password")
      .eq("id", userId)
      .single();

    if (findError || !user) return notFound("Akun tidak ditemukan");

    const passwordValid = await verifyPassword(currentPassword, user.password);
    if (!passwordValid) return badRequest("Kata sandi lama salah");

    const hashedPassword = await hashPassword(newPassword);

    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", user.id);

    if (updateError) {
      console.error("Update password error:", updateError);
      return NextResponse.json({ success: false, message: "Gagal memperbarui kata sandi di database" }, { status: 500 });
    }

    logActivity(userId, "Mengubah kata sandi");

    return NextResponse.json({ success: true, message: "Kata sandi berhasil diperbarui" });
  } catch (error) {
    return serverError(error);
  }
}
