import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPassword, forbidden } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getRole(req: NextRequest) {
  return req.headers.get("x-auth-user-role") || "";
}

function getUsername(req: NextRequest) {
  return req.headers.get("x-auth-user-username") || "";
}

function getUserId(req: NextRequest) {
  return req.headers.get("x-auth-user-id") || "";
}

export async function GET(request: NextRequest) {
  const role = getRole(request);
  if (role !== "super_admin" && role !== "admin") {
    return forbidden("Hanya admin yang dapat melihat data pengguna");
  }

  try {
    const supabase: any = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .select("id, username, role, nama, is_active, created_at")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const role = getRole(request);
  if (role !== "super_admin" && role !== "admin") {
    return forbidden("Hanya admin yang dapat menambah pengguna");
  }

  try {
    const body = await request.json();
    const { username, password, role: newRole, nama } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username dan password harus diisi" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: "Password minimal 6 karakter" }, { status: 400 });
    }

    // Only super_admin can create other super_admin
    if (newRole === "super_admin" && role !== "super_admin") {
      return forbidden("Hanya Super Admin yang dapat membuat akun Super Admin");
    }

    const supabase: any = getSupabaseAdmin();

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: false, message: "Username sudah digunakan" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const { data, error } = await supabase
      .from("users")
      .insert({
        username,
        password: hashedPassword,
        role: newRole || "karyawan",
        nama: nama || username,
      })
      .select("id, username, role, nama, is_active, created_at")
      .single();

    if (error) throw error;
    logActivity(getUserId(request), `Menambah pengguna: ${username}`, getUsername(request));
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
