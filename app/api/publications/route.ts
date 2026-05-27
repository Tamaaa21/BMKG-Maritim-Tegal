import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'publications.json');
    if (!fs.existsSync(dataPath)) return NextResponse.json({ success: true, data: [] });
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const list = JSON.parse(raw || '[]');
    return NextResponse.json({ success: true, data: list });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

export const runtime = 'nodejs';
