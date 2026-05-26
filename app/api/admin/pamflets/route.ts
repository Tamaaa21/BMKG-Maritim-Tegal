import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'pamflets.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'pamflets');

function ensureStorage() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function GET() {
  ensureStorage();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const list = JSON.parse(raw || '[]');
  return new Response(JSON.stringify({ success: true, data: list }), { status: 200 });
}

export async function POST(req: NextRequest) {
  ensureStorage();
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const url = form.get('url')?.toString() || null;
    const title = form.get('title')?.toString() || '';

    let storedUrl = url;
    if (file && (file as any).size) {
      const buf = Buffer.from(await (file as any).arrayBuffer());
      const filename = `pamflet-${Date.now()}-${String((file as any).name || 'upload')}`.replace(/[^a-zA-Z0-9.\-]/g, '_');
      const outPath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(outPath, buf);
      storedUrl = `/uploads/pamflets/${filename}`;
    }

    if (!storedUrl) return new Response(JSON.stringify({ success: false, error: 'No file or url provided' }), { status: 400 });

    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const list = JSON.parse(raw || '[]');
    const id = Date.now().toString();
    const item = { id, url: storedUrl, title, order: list.length + 1 };
    list.push(item);
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
    return new Response(JSON.stringify({ success: true, data: item }), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  ensureStorage();
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ success: false, error: 'id required' }), { status: 400 });
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  let list = JSON.parse(raw || '[]');
  const idx = list.findIndex((i: any) => i.id === id);
  if (idx === -1) return new Response(JSON.stringify({ success: false, error: 'not found' }), { status: 404 });
  const [removed] = list.splice(idx, 1);
  // delete file if local
  try {
    if (removed.url && removed.url.startsWith('/uploads/pamflets/')) {
      const fp = path.join(process.cwd(), 'public', removed.url.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
  } catch (e) {
    // ignore
  }
  // reassign order
  list = list.map((it: any, i: number) => ({ ...it, order: i + 1 }));
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export const runtime = 'nodejs';
