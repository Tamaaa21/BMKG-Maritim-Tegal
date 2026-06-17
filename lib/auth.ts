import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSessionToken as edgeCreateToken, verifySessionToken as edgeVerifyToken, COOKIE_NAME } from "./auth-edge";

export { COOKIE_NAME, SESSION_DURATION_MS } from "./auth-edge";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Re-export edge-compatible functions
export const createSessionToken = edgeCreateToken;
export const verifySessionToken = edgeVerifyToken;

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ success: false, message }, { status: 403 });
}

export function forgeHttpError(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 86400,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
