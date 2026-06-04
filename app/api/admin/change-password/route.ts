import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ success: false, message: "Semua field harus diisi" }, { status: 400 });
    }

    let expectedPassword = "admin123";
    const configDir = path.join(process.cwd(), "data");
    const configPath = path.join(configDir, "admin_config.json");

    try {
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, "utf-8");
        const config = JSON.parse(raw);
        if (config && config.password) {
          expectedPassword = config.password;
        }
      }
    } catch (e) {
      console.error("Error reading admin_config.json", e);
    }

    if (oldPassword !== expectedPassword) {
      return NextResponse.json({ success: false, message: "Kata sandi lama salah" }, { status: 400 });
    }

    // Save new password
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify({ password: newPassword }, null, 2));

    return NextResponse.json({ success: true, message: "Kata sandi berhasil diperbarui" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}

export const runtime = "nodejs";
