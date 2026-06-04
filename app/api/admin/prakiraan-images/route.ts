import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      console.warn("Supabase URL or service key not set");
      return NextResponse.json({ success: false, message: "Supabase not configured" }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey as string);

    const contentType = (req.headers && (req.headers as any).get ? (req.headers as any).get('content-type') : '');

    // If JSON body provided, allow creating an entry from an existing URL (useful for default images)
    if (contentType && contentType.includes('application/json')) {
      const body = await req.json();
      const title = body.title || `prakiraan-${Date.now()}`;
      const explanation = body.explanation || null;
      const providedUrl = body.url;
      const uploader = body.uploader || null;
      const waktuBerakhir = body.waktu_berakhir || body.waktuBerakhir || null;

      if (!providedUrl) return NextResponse.json({ success: false, message: 'No url provided' }, { status: 400 });

      const insertObj: any = { title, url: providedUrl };
      if (explanation) insertObj.explanation = explanation;
      if (uploader) insertObj.uploader = uploader;
      if (waktuBerakhir) insertObj.waktu_berakhir = waktuBerakhir;

      const { data: insertData, error: insertError } = await supabase.from('prakiraan_images').insert(insertObj).select().single();
      if (insertError) throw insertError;
      return NextResponse.json({ success: true, data: insertData });
    }

    // otherwise treat as multipart/form-data upload
    const form = await (req as any).formData();
    const file = form.get('file') as any;
    const title = (form.get('title') as any)?.toString() || file?.name || `prakiraan-${Date.now()}`;
    const explanation = (form.get('explanation') as any)?.toString() || null;
    const uploader = (form.get('uploader') as any)?.toString() || null;
    const waktuBerakhir = (form.get('waktu_berakhir') as any)?.toString() || (form.get('waktuBerakhir') as any)?.toString() || null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'public';
    const path = `prakiraan/${filename}`;

    let { data: uploadData, error: uploadError } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

    if (uploadError) {
      try {
        await supabase.storage.createBucket(bucket, { public: true });
        const retry = await supabase.storage.from(bucket).upload(path, buffer, {
          contentType: file.type,
          upsert: true,
        });
        uploadData = retry.data;
        uploadError = retry.error;
      } catch (bErr) {
        console.error('Bucket create or retry failed', bErr);
      }
    }

    if (uploadError) throw uploadError;

    if (!uploadData || !uploadData.path) {
      throw new Error('Upload succeeded but returned no path');
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
    const publicUrl = (urlData as any)?.publicUrl || '';

    const insertObj: any = { title, url: publicUrl };
    if (explanation) insertObj.explanation = explanation;
    if (uploader) insertObj.uploader = uploader;
    if (waktuBerakhir) insertObj.waktu_berakhir = waktuBerakhir;

    const { data: insertData, error: insertError } = await supabase.from('prakiraan_images').insert(insertObj).select().single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, data: insertData });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      console.warn("Supabase URL or service key not set");
      return NextResponse.json({ success: false, data: [] }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const filterExpired = searchParams.get("filterExpired") === "true";

    const supabase = createClient(url, serviceKey as string);
    
    let query = supabase.from("prakiraan_images").select("*");
    
    if (filterExpired) {
      const nowStr = new Date().toISOString();
      query = query.or(`waktu_berakhir.is.null,waktu_berakhir.gt.${nowStr}`);
    }

    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
