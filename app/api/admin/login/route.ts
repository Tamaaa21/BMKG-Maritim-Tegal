import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyPassword, hashPassword, createSessionToken, setAuthCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";
import { serverError } from "@/lib/response";

export const runtime = "nodejs";

const badRequest = (message: string) =>
  NextResponse.json({ message }, { status: 400 });

const unauthorized = (message: string) =>
  NextResponse.json({ message }, { status: 401 });

const forbidden = (message: string) =>
  NextResponse.json({ message }, { status: 403 });

const tooManyRequests = (message: string) =>
  NextResponse.json({ message }, { status: 429 });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Username dan password harus diisi");
    }

    const { username, password } = parsed.data;

    // Rate limiting berdasarkan IP + username
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    const rateKey = `login:${ip}:${username}`;
    const rateCheck = checkRateLimit(rateKey);

    if (!rateCheck.allowed) {
      return tooManyRequests("Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.");
    }

    const supabase: any = getSupabaseAdmin();

    const result = await supabase
      .from("users")
      .select("id, username, password, role, nama, is_active")
      .eq("username", username)
      .single();

    const user = result.data;
    const error = result.error;

    if (error || !user) {
      return unauthorized("Username atau password salah");
    }

    if (!user.is_active) {
      return forbidden("Akun ini telah dinonaktifkan");
    }

    let passwordValid: boolean;
    if (user.password.startsWith("$2")) {
      passwordValid = await verifyPassword(password, user.password);
    } else {
      passwordValid = user.password === password;
      if (passwordValid) {
        const hashed = await hashPassword(password);
        await supabase.from("users").update({ password: hashed }).eq("id", user.id);
      }
    }

    if (!passwordValid) {
      return unauthorized("Username atau password salah");
    }

    const token = await createSessionToken(user.id, user.role, user.username);

    // Log aktivitas login
    const userAgent = request.headers.get("user-agent") || "unknown";
    const { error: logError } = await supabase.from("login_logs").insert({
      user_id: user.id,
      username: user.username,
      ip_address: ip || "unknown",
      user_agent: userAgent || "unknown",
      aktivitas: "Login ke panel admin",
    });

    if (logError) {
      console.error("Failed to record login log:", logError);
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        nama: user.nama,
      },
      message: "Login berhasil",
    }, { status: 200 });

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
