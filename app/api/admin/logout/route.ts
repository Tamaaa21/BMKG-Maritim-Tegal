import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  clearAuthCookie(response);
  logActivity(request.headers.get("x-auth-user-id"), "Logout dari panel admin", request.headers.get("x-auth-user-username"));
  return response;
}
