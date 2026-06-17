import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { User } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-auth-user-id");
    const role = request.headers.get("x-auth-user-role");
    const username = request.headers.get("x-auth-user-username");

    if (!userId || !role) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const supabase: any = getSupabaseAdmin();
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, role, nama, is_active")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({ success: false, message: "Account disabled" }, { status: 403 });
    }

    return NextResponse.json({ success: true, user: user as User });
  } catch (error: any) {
    console.error("Error fetching current user:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
