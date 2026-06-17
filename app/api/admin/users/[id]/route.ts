import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPassword, forbidden } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";

export const runtime = "nodejs";

function getId(request: NextRequest, context: any): string | undefined {
  try {
    const pathname = request.nextUrl.pathname;
    return pathname.split('/').pop();
  } catch {
    return undefined;
  }
}

function getRole(request: NextRequest) {
  return request.headers.get("x-auth-user-role") || "";
}

function getUserId(request: NextRequest) {
  return request.headers.get("x-auth-user-id") || "";
}

export async function PATCH(request: NextRequest, context: any) {
  const role = getRole(request);
  if (role !== "super_admin" && role !== "admin") {
    return forbidden("Hanya admin yang dapat mengubah pengguna");
  }

  try {
    const id = getId(request, context);
    if (!id) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

    const body = await request.json();
    const supabase: any = getSupabaseAdmin();

    const updateData: any = {};
    if (body.nama !== undefined) updateData.nama = body.nama;
    if (body.role !== undefined) {
      if (body.role === "super_admin" && role !== "super_admin") {
        return forbidden("Hanya Super Admin yang dapat mengubah role ke Super Admin");
      }
      updateData.role = body.role;
    }
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.password) {
      if (body.password.length < 6) {
        return NextResponse.json({ success: false, message: "Password minimal 6 karakter" }, { status: 400 });
      }
      updateData.password = await hashPassword(body.password);
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select("id, username, role, nama, is_active, created_at")
      .single();

    if (error) throw error;
    logActivity(getUserId(request), `Mengubah pengguna: ${data?.username || id}`);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const role = getRole(request);
  if (role !== "super_admin" && role !== "admin") {
    return forbidden("Hanya admin yang dapat menghapus pengguna");
  }

  try {
    const id = getId(request, context);
    if (!id) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

    const supabase: any = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    logActivity(getUserId(request), `Menghapus pengguna: ${data?.username || id}`);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
