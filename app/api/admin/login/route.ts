import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    let expectedPassword = ADMIN_CREDENTIALS.password;
    try {
      const configPath = path.join(process.cwd(), "data", "admin_config.json");
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

    if (username === ADMIN_CREDENTIALS.username && password === expectedPassword) {
      const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

      return NextResponse.json(
        { token, message: "Login berhasil" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Username atau password salah" },
      { status: 401 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
